import { protectedProcedure, router } from "../_core/trpc";
import dashboardData from "../data/dashboard.json";

export const dashboardRouter = router({
  overview: protectedProcedure.query(() => dashboardData),
});
