import { Hono } from 'hono';

import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthEnv } from '../middleware/auth.js';
import { buildWeeklyReport } from '../utils/reporting.js';

async function getWeeklyReportForUser(userId: string) {
  const submissions = await prisma.dailyImmunitySubmission.findMany({
    where: { userId },
    orderBy: { submittedAt: 'desc' },
    take: 60,
  });

  return buildWeeklyReport(submissions);
}

const reportsRouter = new Hono<AuthEnv>();
reportsRouter.use('*', requireAuth);

reportsRouter.get('/weekly', async c => {
  const dbUser = c.get('dbUser');
  const report = await getWeeklyReportForUser(dbUser.id);

  await prisma.weeklyReport.create({
    data: {
      userId: dbUser.id,
      weekStart: new Date(report.currentReportDate),
      weekEnd: new Date(),
      overallCurrent: report.overall.current,
      overallPrevious: report.overall.previous,
      overallDelta: report.overall.difference,
      trend: report.overall.trend,
      payloadJson: report,
    },
  });

  return c.json(report);
});

reportsRouter.post('/weekly/generate', async c => {
  const dbUser = c.get('dbUser');
  const report = await getWeeklyReportForUser(dbUser.id);

  return c.json({
    success: true,
    message: 'Weekly report generated successfully.',
    data: report,
  });
});

const legacyReportsRouter = new Hono<AuthEnv>();
legacyReportsRouter.use('*', requireAuth);

legacyReportsRouter.post('/weekly-report', async c => {
  const dbUser = c.get('dbUser');

  try {
    await c.req.json();
  } catch {
    // Legacy route previously accepted a body. It is intentionally ignored now.
  }

  const report = await getWeeklyReportForUser(dbUser.id);
  return c.json(report);
});

export { legacyReportsRouter };
export default reportsRouter;
