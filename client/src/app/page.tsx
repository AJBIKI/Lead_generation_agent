'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const [icp, setIcp] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [reports, setReports] = useState([]);
  const [errors, setErrors] = useState([]);

  const startCampaign = async () => {
    if (!icp) return;
    setLoading(true);
    setErrors([]);
    setLeads([]);
    setReports([]);

    try {
      // In a real app, this URL should be in an enviroment variable
      const response = await axios.post('http://localhost:5000/api/agents/start-campaign', { icp });

      const data = response.data;
      if (data.data) {
        setLeads(data.data.leads || []);
        setReports(data.data.reports || []);
        setErrors(data.data.errors || []);
      }
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Revenue Engine <span className="text-blue-600">v1.0</span></h1>
        <p className="text-slate-500 mt-2">Autonomous Lead Generation & Deep Research</p>
      </header>

      <div className="grid gap-6 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Campaign Configuration</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input
              placeholder="Describe your Ideal Customer Profile (e.g., 'Series A Healthcare Startups in Boston')"
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              className="flex-1"
            />
            <Button onClick={startCampaign} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Autonomous Agent Running...</> : <><Search className="mr-2 h-4 w-4" /> Start Campaign</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Identified Leads Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center"><Search className="mr-2 h-5 w-5 text-slate-400" /> Identified Leads ({leads.length})</h2>
          {leads.map((lead, idx) => (
            <Card key={idx} className="bg-white border-l-4 border-l-blue-500 shadow-sm">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg">{lead.company_name}</h3>
                <a href={lead.website} target="_blank" className="text-sm text-blue-500 hover:underline">{lead.website}</a>
                <p className="text-sm text-slate-600 mt-2 line-clamp-3">{lead.context}</p>
              </CardContent>
            </Card>
          ))}
          {leads.length === 0 && !loading && <div className="text-slate-400 italic">No leads identified yet.</div>}
        </div>

        {/* Deep Dive Reports Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center"><CheckCircle className="mr-2 h-5 w-5 text-green-500" /> Deep-Dive Dossiers ({reports.length})</h2>
          {reports.map((report, idx) => (
            <Card key={idx} className="bg-white border-l-4 border-l-green-500 shadow-sm">
              <CardContent className="pt-6">
                <h3 className="font-bold text-lg">{report.company_name}</h3>
                <div className="mt-2 bg-slate-100 p-3 rounded text-xs font-mono overflow-auto max-h-40">
                  {/* In a real GenUI, this would be a rich component. For MVP, showing raw preview. */}
                  {report.deep_dive?.raw_content_preview || "No research data available."}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="w-full">View Full Dossier</Button>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">Generate Email</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {reports.length === 0 && !loading && <div className="text-slate-400 italic">No research reports generated yet.</div>}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <h3 className="font-bold flex items-center"><AlertCircle className="mr-2 h-4 w-4" /> Errors Detected:</h3>
          <ul className="list-disc list-inside">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
