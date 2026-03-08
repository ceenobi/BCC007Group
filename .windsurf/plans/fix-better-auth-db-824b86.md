# Fix Better Auth DB Connection Issue

Update `better-auth.ts` to use top-level await for `connectToDB()` before exporting the `auth` object, ensuring MongoDB is connected and `mongoose.connection.db` is defined when Better Auth initializes. Remove the async start function and call `await connectToDB();` directly at the top. Additionally, remove the `connectMongoDb` wrapper in `app.ts` `startServer` since the connection is now handled at module load time for Better Auth.
