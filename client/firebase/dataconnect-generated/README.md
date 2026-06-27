# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `mobile`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*GetMyDailyImmunityHistory*](#getmydailyimmunityhistory)
  - [*GetMyWeeklyReports*](#getmyweeklyreports)
- [**Mutations**](#mutations)
  - [*UpsertCurrentUser*](#upsertcurrentuser)
  - [*UpsertMyProfile*](#upsertmyprofile)
  - [*SubmitDailyImmunity*](#submitdailyimmunity)
  - [*CreateWeeklyReport*](#createweeklyreport)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `mobile`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `mobile` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentUserData {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    provider?: string | null;
    createdAt: TimestampString;
    lastLoginAt?: TimestampString | null;
    profile?: {
      gender?: string | null;
      age?: number | null;
      weightKg?: number | null;
      heightCm?: number | null;
      purpose?: string | null;
      address?: string | null;
      createdAt: TimestampString;
      updatedAt: TimestampString;
    };
  } & User_Key;
}
```
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser } from '@dataconnect/generated';


// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef } from '@dataconnect/generated';


// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetMyDailyImmunityHistory
You can execute the `GetMyDailyImmunityHistory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyDailyImmunityHistory(): QueryPromise<GetMyDailyImmunityHistoryData, undefined>;

interface GetMyDailyImmunityHistoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyDailyImmunityHistoryData, undefined>;
}
export const getMyDailyImmunityHistoryRef: GetMyDailyImmunityHistoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyDailyImmunityHistory(dc: DataConnect): QueryPromise<GetMyDailyImmunityHistoryData, undefined>;

interface GetMyDailyImmunityHistoryRef {
  ...
  (dc: DataConnect): QueryRef<GetMyDailyImmunityHistoryData, undefined>;
}
export const getMyDailyImmunityHistoryRef: GetMyDailyImmunityHistoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyDailyImmunityHistoryRef:
```typescript
const name = getMyDailyImmunityHistoryRef.operationName;
console.log(name);
```

### Variables
The `GetMyDailyImmunityHistory` query has no variables.
### Return Type
Recall that executing the `GetMyDailyImmunityHistory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyDailyImmunityHistoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyDailyImmunityHistoryData {
  user?: {
    submissions: ({
      id: UUIDString;
      submittedDate: DateString;
      submittedAt: TimestampString;
      immunityScore: number;
      immunityLevel: string;
      physicalEnergy?: number | null;
      appetite?: number | null;
      digestionComfort?: number | null;
      burningPain?: number | null;
      bloatingGas?: number | null;
      bloodPressure?: number | null;
      swelling?: number | null;
      fever?: number | null;
      infection?: number | null;
      breathingProblem?: number | null;
      menstrualRegularity?: number | null;
      libidoStability?: number | null;
      hairHealth?: number | null;
      sleepHours?: number | null;
    } & DailyImmunitySubmission_Key)[];
  };
}
```
### Using `GetMyDailyImmunityHistory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyDailyImmunityHistory } from '@dataconnect/generated';


// Call the `getMyDailyImmunityHistory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyDailyImmunityHistory();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyDailyImmunityHistory(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getMyDailyImmunityHistory().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetMyDailyImmunityHistory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyDailyImmunityHistoryRef } from '@dataconnect/generated';


// Call the `getMyDailyImmunityHistoryRef()` function to get a reference to the query.
const ref = getMyDailyImmunityHistoryRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyDailyImmunityHistoryRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetMyWeeklyReports
You can execute the `GetMyWeeklyReports` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMyWeeklyReports(): QueryPromise<GetMyWeeklyReportsData, undefined>;

interface GetMyWeeklyReportsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyWeeklyReportsData, undefined>;
}
export const getMyWeeklyReportsRef: GetMyWeeklyReportsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyWeeklyReports(dc: DataConnect): QueryPromise<GetMyWeeklyReportsData, undefined>;

interface GetMyWeeklyReportsRef {
  ...
  (dc: DataConnect): QueryRef<GetMyWeeklyReportsData, undefined>;
}
export const getMyWeeklyReportsRef: GetMyWeeklyReportsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyWeeklyReportsRef:
```typescript
const name = getMyWeeklyReportsRef.operationName;
console.log(name);
```

### Variables
The `GetMyWeeklyReports` query has no variables.
### Return Type
Recall that executing the `GetMyWeeklyReports` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyWeeklyReportsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMyWeeklyReportsData {
  user?: {
    reports: ({
      weekStart: DateString;
      weekEnd: DateString;
      overallCurrent: number;
      overallPrevious?: number | null;
      overallDelta?: number | null;
      trend: string;
      summary?: string | null;
      payload?: unknown | null;
      generatedAt: TimestampString;
    })[];
  };
}
```
### Using `GetMyWeeklyReports`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyWeeklyReports } from '@dataconnect/generated';


// Call the `getMyWeeklyReports()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyWeeklyReports();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyWeeklyReports(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getMyWeeklyReports().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetMyWeeklyReports`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyWeeklyReportsRef } from '@dataconnect/generated';


// Call the `getMyWeeklyReportsRef()` function to get a reference to the query.
const ref = getMyWeeklyReportsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyWeeklyReportsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `mobile` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## UpsertCurrentUser
You can execute the `UpsertCurrentUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertCurrentUser(vars?: UpsertCurrentUserVariables): MutationPromise<UpsertCurrentUserData, UpsertCurrentUserVariables>;

interface UpsertCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: UpsertCurrentUserVariables): MutationRef<UpsertCurrentUserData, UpsertCurrentUserVariables>;
}
export const upsertCurrentUserRef: UpsertCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertCurrentUser(dc: DataConnect, vars?: UpsertCurrentUserVariables): MutationPromise<UpsertCurrentUserData, UpsertCurrentUserVariables>;

interface UpsertCurrentUserRef {
  ...
  (dc: DataConnect, vars?: UpsertCurrentUserVariables): MutationRef<UpsertCurrentUserData, UpsertCurrentUserVariables>;
}
export const upsertCurrentUserRef: UpsertCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertCurrentUserRef:
```typescript
const name = upsertCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertCurrentUser` mutation has an optional argument of type `UpsertCurrentUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertCurrentUserVariables {
  name?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  provider?: string | null;
}
```
### Return Type
Recall that executing the `UpsertCurrentUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertCurrentUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertCurrentUser, UpsertCurrentUserVariables } from '@dataconnect/generated';

// The `UpsertCurrentUser` mutation has an optional argument of type `UpsertCurrentUserVariables`:
const upsertCurrentUserVars: UpsertCurrentUserVariables = {
  name: ..., // optional
  email: ..., // optional
  photoUrl: ..., // optional
  provider: ..., // optional
};

// Call the `upsertCurrentUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertCurrentUser(upsertCurrentUserVars);
// Variables can be defined inline as well.
const { data } = await upsertCurrentUser({ name: ..., email: ..., photoUrl: ..., provider: ..., });
// Since all variables are optional for this mutation, you can omit the `UpsertCurrentUserVariables` argument.
const { data } = await upsertCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertCurrentUser(dataConnect, upsertCurrentUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertCurrentUser(upsertCurrentUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertCurrentUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertCurrentUserRef, UpsertCurrentUserVariables } from '@dataconnect/generated';

// The `UpsertCurrentUser` mutation has an optional argument of type `UpsertCurrentUserVariables`:
const upsertCurrentUserVars: UpsertCurrentUserVariables = {
  name: ..., // optional
  email: ..., // optional
  photoUrl: ..., // optional
  provider: ..., // optional
};

// Call the `upsertCurrentUserRef()` function to get a reference to the mutation.
const ref = upsertCurrentUserRef(upsertCurrentUserVars);
// Variables can be defined inline as well.
const ref = upsertCurrentUserRef({ name: ..., email: ..., photoUrl: ..., provider: ..., });
// Since all variables are optional for this mutation, you can omit the `UpsertCurrentUserVariables` argument.
const ref = upsertCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertCurrentUserRef(dataConnect, upsertCurrentUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

## UpsertMyProfile
You can execute the `UpsertMyProfile` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertMyProfile(vars?: UpsertMyProfileVariables): MutationPromise<UpsertMyProfileData, UpsertMyProfileVariables>;

interface UpsertMyProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars?: UpsertMyProfileVariables): MutationRef<UpsertMyProfileData, UpsertMyProfileVariables>;
}
export const upsertMyProfileRef: UpsertMyProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertMyProfile(dc: DataConnect, vars?: UpsertMyProfileVariables): MutationPromise<UpsertMyProfileData, UpsertMyProfileVariables>;

interface UpsertMyProfileRef {
  ...
  (dc: DataConnect, vars?: UpsertMyProfileVariables): MutationRef<UpsertMyProfileData, UpsertMyProfileVariables>;
}
export const upsertMyProfileRef: UpsertMyProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertMyProfileRef:
```typescript
const name = upsertMyProfileRef.operationName;
console.log(name);
```

### Variables
The `UpsertMyProfile` mutation has an optional argument of type `UpsertMyProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertMyProfileVariables {
  gender?: string | null;
  age?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  purpose?: string | null;
  address?: string | null;
}
```
### Return Type
Recall that executing the `UpsertMyProfile` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertMyProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertMyProfileData {
  patientProfile_upsert: PatientProfile_Key;
}
```
### Using `UpsertMyProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertMyProfile, UpsertMyProfileVariables } from '@dataconnect/generated';

// The `UpsertMyProfile` mutation has an optional argument of type `UpsertMyProfileVariables`:
const upsertMyProfileVars: UpsertMyProfileVariables = {
  gender: ..., // optional
  age: ..., // optional
  weightKg: ..., // optional
  heightCm: ..., // optional
  purpose: ..., // optional
  address: ..., // optional
};

// Call the `upsertMyProfile()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertMyProfile(upsertMyProfileVars);
// Variables can be defined inline as well.
const { data } = await upsertMyProfile({ gender: ..., age: ..., weightKg: ..., heightCm: ..., purpose: ..., address: ..., });
// Since all variables are optional for this mutation, you can omit the `UpsertMyProfileVariables` argument.
const { data } = await upsertMyProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertMyProfile(dataConnect, upsertMyProfileVars);

console.log(data.patientProfile_upsert);

// Or, you can use the `Promise` API.
upsertMyProfile(upsertMyProfileVars).then((response) => {
  const data = response.data;
  console.log(data.patientProfile_upsert);
});
```

### Using `UpsertMyProfile`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertMyProfileRef, UpsertMyProfileVariables } from '@dataconnect/generated';

// The `UpsertMyProfile` mutation has an optional argument of type `UpsertMyProfileVariables`:
const upsertMyProfileVars: UpsertMyProfileVariables = {
  gender: ..., // optional
  age: ..., // optional
  weightKg: ..., // optional
  heightCm: ..., // optional
  purpose: ..., // optional
  address: ..., // optional
};

// Call the `upsertMyProfileRef()` function to get a reference to the mutation.
const ref = upsertMyProfileRef(upsertMyProfileVars);
// Variables can be defined inline as well.
const ref = upsertMyProfileRef({ gender: ..., age: ..., weightKg: ..., heightCm: ..., purpose: ..., address: ..., });
// Since all variables are optional for this mutation, you can omit the `UpsertMyProfileVariables` argument.
const ref = upsertMyProfileRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertMyProfileRef(dataConnect, upsertMyProfileVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patientProfile_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patientProfile_upsert);
});
```

## SubmitDailyImmunity
You can execute the `SubmitDailyImmunity` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
submitDailyImmunity(vars: SubmitDailyImmunityVariables): MutationPromise<SubmitDailyImmunityData, SubmitDailyImmunityVariables>;

interface SubmitDailyImmunityRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SubmitDailyImmunityVariables): MutationRef<SubmitDailyImmunityData, SubmitDailyImmunityVariables>;
}
export const submitDailyImmunityRef: SubmitDailyImmunityRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
submitDailyImmunity(dc: DataConnect, vars: SubmitDailyImmunityVariables): MutationPromise<SubmitDailyImmunityData, SubmitDailyImmunityVariables>;

interface SubmitDailyImmunityRef {
  ...
  (dc: DataConnect, vars: SubmitDailyImmunityVariables): MutationRef<SubmitDailyImmunityData, SubmitDailyImmunityVariables>;
}
export const submitDailyImmunityRef: SubmitDailyImmunityRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the submitDailyImmunityRef:
```typescript
const name = submitDailyImmunityRef.operationName;
console.log(name);
```

### Variables
The `SubmitDailyImmunity` mutation requires an argument of type `SubmitDailyImmunityVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SubmitDailyImmunityVariables {
  physicalEnergy?: number | null;
  appetite?: number | null;
  digestionComfort?: number | null;
  burningPain?: number | null;
  bloatingGas?: number | null;
  bloodPressure?: number | null;
  swelling?: number | null;
  fever?: number | null;
  infection?: number | null;
  breathingProblem?: number | null;
  menstrualRegularity?: number | null;
  libidoStability?: number | null;
  hairHealth?: number | null;
  sleepHours?: number | null;
  immunityScore: number;
  immunityLevel: string;
}
```
### Return Type
Recall that executing the `SubmitDailyImmunity` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SubmitDailyImmunityData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SubmitDailyImmunityData {
  dailyImmunitySubmission_insert: DailyImmunitySubmission_Key;
}
```
### Using `SubmitDailyImmunity`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, submitDailyImmunity, SubmitDailyImmunityVariables } from '@dataconnect/generated';

// The `SubmitDailyImmunity` mutation requires an argument of type `SubmitDailyImmunityVariables`:
const submitDailyImmunityVars: SubmitDailyImmunityVariables = {
  physicalEnergy: ..., // optional
  appetite: ..., // optional
  digestionComfort: ..., // optional
  burningPain: ..., // optional
  bloatingGas: ..., // optional
  bloodPressure: ..., // optional
  swelling: ..., // optional
  fever: ..., // optional
  infection: ..., // optional
  breathingProblem: ..., // optional
  menstrualRegularity: ..., // optional
  libidoStability: ..., // optional
  hairHealth: ..., // optional
  sleepHours: ..., // optional
  immunityScore: ..., 
  immunityLevel: ..., 
};

// Call the `submitDailyImmunity()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await submitDailyImmunity(submitDailyImmunityVars);
// Variables can be defined inline as well.
const { data } = await submitDailyImmunity({ physicalEnergy: ..., appetite: ..., digestionComfort: ..., burningPain: ..., bloatingGas: ..., bloodPressure: ..., swelling: ..., fever: ..., infection: ..., breathingProblem: ..., menstrualRegularity: ..., libidoStability: ..., hairHealth: ..., sleepHours: ..., immunityScore: ..., immunityLevel: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await submitDailyImmunity(dataConnect, submitDailyImmunityVars);

console.log(data.dailyImmunitySubmission_insert);

// Or, you can use the `Promise` API.
submitDailyImmunity(submitDailyImmunityVars).then((response) => {
  const data = response.data;
  console.log(data.dailyImmunitySubmission_insert);
});
```

### Using `SubmitDailyImmunity`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, submitDailyImmunityRef, SubmitDailyImmunityVariables } from '@dataconnect/generated';

// The `SubmitDailyImmunity` mutation requires an argument of type `SubmitDailyImmunityVariables`:
const submitDailyImmunityVars: SubmitDailyImmunityVariables = {
  physicalEnergy: ..., // optional
  appetite: ..., // optional
  digestionComfort: ..., // optional
  burningPain: ..., // optional
  bloatingGas: ..., // optional
  bloodPressure: ..., // optional
  swelling: ..., // optional
  fever: ..., // optional
  infection: ..., // optional
  breathingProblem: ..., // optional
  menstrualRegularity: ..., // optional
  libidoStability: ..., // optional
  hairHealth: ..., // optional
  sleepHours: ..., // optional
  immunityScore: ..., 
  immunityLevel: ..., 
};

// Call the `submitDailyImmunityRef()` function to get a reference to the mutation.
const ref = submitDailyImmunityRef(submitDailyImmunityVars);
// Variables can be defined inline as well.
const ref = submitDailyImmunityRef({ physicalEnergy: ..., appetite: ..., digestionComfort: ..., burningPain: ..., bloatingGas: ..., bloodPressure: ..., swelling: ..., fever: ..., infection: ..., breathingProblem: ..., menstrualRegularity: ..., libidoStability: ..., hairHealth: ..., sleepHours: ..., immunityScore: ..., immunityLevel: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = submitDailyImmunityRef(dataConnect, submitDailyImmunityVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.dailyImmunitySubmission_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.dailyImmunitySubmission_insert);
});
```

## CreateWeeklyReport
You can execute the `CreateWeeklyReport` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createWeeklyReport(vars: CreateWeeklyReportVariables): MutationPromise<CreateWeeklyReportData, CreateWeeklyReportVariables>;

interface CreateWeeklyReportRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateWeeklyReportVariables): MutationRef<CreateWeeklyReportData, CreateWeeklyReportVariables>;
}
export const createWeeklyReportRef: CreateWeeklyReportRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createWeeklyReport(dc: DataConnect, vars: CreateWeeklyReportVariables): MutationPromise<CreateWeeklyReportData, CreateWeeklyReportVariables>;

interface CreateWeeklyReportRef {
  ...
  (dc: DataConnect, vars: CreateWeeklyReportVariables): MutationRef<CreateWeeklyReportData, CreateWeeklyReportVariables>;
}
export const createWeeklyReportRef: CreateWeeklyReportRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createWeeklyReportRef:
```typescript
const name = createWeeklyReportRef.operationName;
console.log(name);
```

### Variables
The `CreateWeeklyReport` mutation requires an argument of type `CreateWeeklyReportVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateWeeklyReportVariables {
  weekStart: DateString;
  weekEnd: DateString;
  overallCurrent: number;
  overallPrevious?: number | null;
  overallDelta?: number | null;
  trend: string;
  summary?: string | null;
  payload?: unknown | null;
}
```
### Return Type
Recall that executing the `CreateWeeklyReport` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateWeeklyReportData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateWeeklyReportData {
  weeklyReport_upsert: WeeklyReport_Key;
}
```
### Using `CreateWeeklyReport`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createWeeklyReport, CreateWeeklyReportVariables } from '@dataconnect/generated';

// The `CreateWeeklyReport` mutation requires an argument of type `CreateWeeklyReportVariables`:
const createWeeklyReportVars: CreateWeeklyReportVariables = {
  weekStart: ..., 
  weekEnd: ..., 
  overallCurrent: ..., 
  overallPrevious: ..., // optional
  overallDelta: ..., // optional
  trend: ..., 
  summary: ..., // optional
  payload: ..., // optional
};

// Call the `createWeeklyReport()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createWeeklyReport(createWeeklyReportVars);
// Variables can be defined inline as well.
const { data } = await createWeeklyReport({ weekStart: ..., weekEnd: ..., overallCurrent: ..., overallPrevious: ..., overallDelta: ..., trend: ..., summary: ..., payload: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createWeeklyReport(dataConnect, createWeeklyReportVars);

console.log(data.weeklyReport_upsert);

// Or, you can use the `Promise` API.
createWeeklyReport(createWeeklyReportVars).then((response) => {
  const data = response.data;
  console.log(data.weeklyReport_upsert);
});
```

### Using `CreateWeeklyReport`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createWeeklyReportRef, CreateWeeklyReportVariables } from '@dataconnect/generated';

// The `CreateWeeklyReport` mutation requires an argument of type `CreateWeeklyReportVariables`:
const createWeeklyReportVars: CreateWeeklyReportVariables = {
  weekStart: ..., 
  weekEnd: ..., 
  overallCurrent: ..., 
  overallPrevious: ..., // optional
  overallDelta: ..., // optional
  trend: ..., 
  summary: ..., // optional
  payload: ..., // optional
};

// Call the `createWeeklyReportRef()` function to get a reference to the mutation.
const ref = createWeeklyReportRef(createWeeklyReportVars);
// Variables can be defined inline as well.
const ref = createWeeklyReportRef({ weekStart: ..., weekEnd: ..., overallCurrent: ..., overallPrevious: ..., overallDelta: ..., trend: ..., summary: ..., payload: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createWeeklyReportRef(dataConnect, createWeeklyReportVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.weeklyReport_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.weeklyReport_upsert);
});
```

