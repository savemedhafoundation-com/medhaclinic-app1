# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { upsertCurrentUser, upsertMyProfile, submitDailyImmunity, createWeeklyReport, getCurrentUser, getMyDailyImmunityHistory, getMyWeeklyReports } from '@dataconnect/generated';


// Operation UpsertCurrentUser:  For variables, look at type UpsertCurrentUserVars in ../index.d.ts
const { data } = await UpsertCurrentUser(dataConnect, upsertCurrentUserVars);

// Operation UpsertMyProfile:  For variables, look at type UpsertMyProfileVars in ../index.d.ts
const { data } = await UpsertMyProfile(dataConnect, upsertMyProfileVars);

// Operation SubmitDailyImmunity:  For variables, look at type SubmitDailyImmunityVars in ../index.d.ts
const { data } = await SubmitDailyImmunity(dataConnect, submitDailyImmunityVars);

// Operation CreateWeeklyReport:  For variables, look at type CreateWeeklyReportVars in ../index.d.ts
const { data } = await CreateWeeklyReport(dataConnect, createWeeklyReportVars);

// Operation GetCurrentUser: 
const { data } = await GetCurrentUser(dataConnect);

// Operation GetMyDailyImmunityHistory: 
const { data } = await GetMyDailyImmunityHistory(dataConnect);

// Operation GetMyWeeklyReports: 
const { data } = await GetMyWeeklyReports(dataConnect);


```