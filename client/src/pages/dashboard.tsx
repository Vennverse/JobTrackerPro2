import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/stats-cards";
import { ApplicationsTable } from "@/components/applications-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('Dashboard rendering:', { isAuthenticated, isLoading });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/applications/stats"],
    retry: false,
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    retry: false,
  });

  console.log('Dashboard data:', { stats, applications, statsLoading, applicationsLoading });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <h1 style={{ color: 'black', fontSize: '24px' }}>Loading...</h1>
      </div>
    );
  }

  const recentApplications = Array.isArray(applications) ? applications.slice(0, 5) : [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', padding: '20px' }}>
      <Navbar />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: 'black', fontSize: '32px', marginBottom: '20px' }}>
          Dashboard - Test Version
        </h1>
        
        <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Debug Info</h2>
          <p style={{ color: 'black' }}>Authentication: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p style={{ color: 'black' }}>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p style={{ color: 'black' }}>Stats Loading: {statsLoading ? 'Yes' : 'No'}</p>
          <p style={{ color: 'black' }}>Apps Loading: {applicationsLoading ? 'Yes' : 'No'}</p>
          <p style={{ color: 'black' }}>Stats Data: {JSON.stringify(stats)}</p>
          <p style={{ color: 'black' }}>Apps Data: {JSON.stringify(applications)}</p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Statistics</h2>
          <StatsCards stats={stats as any} isLoading={statsLoading} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Recent Applications</h2>
          <ApplicationsTable 
            applications={recentApplications} 
            isLoading={applicationsLoading} 
          />
        </div>
      </div>
    </div>
  );
}
