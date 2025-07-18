import 'dotenv/config';

export default {
  expo: {
    name: 'Grouphaven',
    slug: 'GrouphavenApp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    extra: {
      SUPABASE_URL: 'https://lrryxyalvumuuvefxhrg.supabase.com',
      SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxycnl4eWFsdnVtdXV2ZWZ4aHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDI1MTUsImV4cCI6MjA0OTExODUxNX0.OPUCbJI_3ufrSJ7dX7PH6XCpL5jj8cn9dv9AwvX4y_c',
      STREAM_API_KEY: 'h5j8g4mbjb5z',
    },
  },
};
