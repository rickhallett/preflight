# Initial Setup
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
  
This project is connected to the Convex deployment named [`ceaseless-bird-840`](https://dashboard.convex.dev/d/ceaseless-bird-840).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## PRD Consistency Tools

The project includes tools to ensure consistency between PRD specifications and their implementations:

### Auditing PRD Consistency

To check if all PRDs are consistent with their implementations:

```bash
bun run audit:prd
```

This will generate an `audit_report.csv` file with details on all inconsistencies.

### Fixing PRD Inconsistencies

To automatically fix inconsistencies found by the audit:

```bash
bun run fix:prd
```

### Validation During Seeding

The step seeding process now includes validation to prevent inconsistencies between PRD specifications and their implementations. When running the seed script, it will validate each PRD and warn about potential inconsistencies:

```bash
bun run scripts/seed_steps_from_prds.mjs
```

### Automated Testing

Run the automated consistency test (useful for CI/CD):

```bash
bun run scripts/automated_testing/test_prd_consistency.mjs
```
