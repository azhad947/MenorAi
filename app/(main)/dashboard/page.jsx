import { getIndustryInsight } from "@/actions/dashboard";
import { getOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import React from "react";
import DashboardView from "./_components/DashboardView";

const Dashboard = async () => {
  const { isOnboarded } = await getOnboardingStatus();
  const insights = await getIndustryInsight();
  console.log(insights)
  if (!isOnboarded) {
    redirect("/onBoarding");
  }
  return <div className="container mx-auto">
    <DashboardView insights={insights} />
  </div>; 
};

export default Dashboard;