(function () {
  var host = window.location.hostname;
  var isProductionHost = host === "www.calmtails.ca";

  var sharedConfig = {
    appOpenUrl: "calmtails://",
    returnToSignInUrl: "/",
    minPasswordLength: 6,
  };

  var devConfig = {
    supabaseUrl: "https://rzumawpdulwvfjpflpoq.supabase.co",
    supabaseAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dW1hd3BkdWx3dmZqcGZscG9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NDUwMzIsImV4cCI6MjA4MTIyMTAzMn0.ScyJHgDxY0w4sXBhCalbUGEuxUG97zHtQKGMjBod_CM",
    supabasePublishableKey: "",
  };

  var productionConfig = {
    supabaseUrl: "https://gtacwfapwxfrldaxlhch.supabase.co",
    supabaseAnonKey:
      "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YWN3ZmFwd3hmcmxkYXhsaGNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Njc2MDksImV4cCI6MjA4MTM0MzYwOX0.kkvMHqB7gBDR66eHZ8XpgXoYmCcrrSqKOQ9uLeOXhDE",
    supabasePublishableKey: "",
  };

  window.CALMTAILS_RESET_CONFIG = Object.assign(
    {},
    sharedConfig,
    isProductionHost ? productionConfig : devConfig,
  );
})();
