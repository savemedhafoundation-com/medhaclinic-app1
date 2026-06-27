# Google Play Wellness Policy Audit

## Positioning

Target app name: Medha Wellness

Target category: Health & Fitness

Positioning: general wellness, lifestyle tracking, daily wellness insights, habit monitoring, and general wellness education.

Not positioned as: medical, diagnostic, clinical, treatment-oriented, prescription-oriented, or certification-oriented.

## High Risk Findings

- Medical/clinical branding terms in visible UI: fixed by replacing Medha Clinic/MedhaClinic with Medha Wellness.
- Certificate wording and route naming: fixed by changing visible screens to wellness summaries and moving Expo routes from certification/certificate to wellness-summary.
- Doctor/clinic contact wording: fixed by changing visible support copy to support/advisor wording.
- Immunotherapy checkout copy: fixed by changing payment description to wellness support products.
- Short disclaimer: fixed with full wellness-only disclaimer.
- Lab/medical record upload wording: fixed by changing visible labels to wellness notes and optional images.
- Disease/therapy product package names: fixed by changing seeded store packages to neutral wellness-support packages.
- Symptom-style assessment labels: fixed by changing visible labels such as blood pressure, fever, infection, and breathing problem to body-comfort and lifestyle-balance wording.

## Medium Risk Findings

- Internal database/API model names still include PatientProfile and WeeklyReport. These are not visible user-facing claims and are retained to avoid breaking migrations, API compatibility, and stored data.
- Firebase, package, service, and deployment identifiers still contain medhaclinic. These are technical identifiers and must remain stable for auth, signing, Google services, and deployed backend connectivity.
- Required disclaimer intentionally contains terms such as diagnose, treat, cure, prevent, medical device, and disease because that wording is compliance-facing and appears as a safety limitation.
- Admin dashboard still contains internal operational words such as reports and submissions. Visible patient wording was softened to members where practical.

## Safe Findings

- Android permissions are minimal: INTERNET and VIBRATE. Storage/system-alert-window permissions are explicitly removed from the main manifest.
- Android applicationId remains com.medhaclinic.app to preserve Firebase and Play Store identity.
- Deep link schemes remain unchanged to avoid breaking existing app links.
- No iOS project or fastlane metadata was found in this repository.
- Location/photo permission prompts in app.json are purpose-limited to delivery address assistance and profile photo upload. Main AndroidManifest does not request location, camera, microphone, advertising ID, or health data permissions.

## Required Store Listing

Title: Medha Wellness - Daily Wellness Tracker

Short description: Track daily wellness habits, lifestyle insights, and wellness progress in one simple app.

Category: Health & Fitness

Avoid Medical category and avoid medical claims in screenshots, feature graphics, or release notes.

## Official Policy References

- Google Play Developer Policy Center: Health Content and Services: https://support.google.com/googleplay/android-developer/answer/12261419
- Google Play Health apps declaration form guidance: https://support.google.com/googleplay/android-developer/answer/14738291
