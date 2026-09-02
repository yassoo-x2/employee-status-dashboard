import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { calculateKpis, filterDashboardRecords } from "@shared/dashboard-utils";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Activity, CalendarDays, ShieldAlert, RotateCcw, ArrowUpLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#0b5d4d", "#c9ab72", "#8d2638", "#33423f", "#9c6b35", "#66736f", "#e3d7bd"];
const nf = new Intl.NumberFormat("en-US");
const label = (value: string) => value || "غير محدد";

function MetricCard({ title, value, hint, icon: Icon, tone }: { title: string; value: number; hint: string; icon: typeof Users; tone: string }) {
  return <Card className="relative min-w-0 overflow-hidden border-0 bg-white/90 shadow-sm">
    <div className={`absolute inset-y-0 right-0 w-1 ${tone}`} />
    <CardContent className="p-3">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{nf.format(value)}</p><p className="mt-2 text-xs text-slate-400">{hint}</p></div>
        <div className={`rounded-2xl p-3 ${tone.replace("bg-", "bg-")}/10`}><Icon className="h-5 w-5 text-[#0b5d4d]" /></div>
      </div>
    </CardContent>
  </Card>;
}

export default function Home() {
  const { data, isLoading, error } = trpc.dashboard.overview.useQuery();
  const [view, setView] = useState("overview");
  const [month, setMonth] = useState("all");
  const [status, setStatus] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [department, setDepartment] = useState("all");
  const [chartsReady, setChartsReady] = useState(false);

    useEffect(() => {
    const frame = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const filtered = useMemo(() => data ? filterDashboardRecords(data.reconciled as any, { month, status, organization, department }) : [], [data, month, status, organization, department]);

  if (isLoading) return <DashboardLayout><div className="p-8 text-center text-slate-500">جارٍ تحميل بيانات الموظفين...</div></DashboardLayout>;
  if (error || !data) return <DashboardLayout><div className="p-8 text-center text-red-600">تعذر تحميل بيانات اللوحة. يرجى تسجيل الدخول أو إعادة المحاولة.</div></DashboardLayout>;
  const q = data.quality;
  const kpis = { ...calculateKpis(q), totalEmployees: filtered.length, totalUpdates: filtered.reduce((sum: number, record: any) => sum + (record.movementHistory?.length || 0), 0) };
  const latestUpdates = filtered.map((record: any) => record.latestUpdate).filter(Boolean);
  const activeCount = latestUpdates.filter((update: any) => /على رأس|على راس|مباشر|فعال|قائم/.test(update.status || "")).length;
  const aggregate = (key: string) => Object.entries(latestUpdates.reduce((acc: Record<string, number>, item: any) => { const value = item?.[key] || "غير محدد"; acc[value] = (acc[value] || 0) + 1; return acc; }, {})).map(([label, value]) => ({ label, value: value as number })).sort((a, b) => b.value - a.value);
  const updateChart = aggregate("month").slice().reverse().map((x: any) => ({ ...x, name: x.label?.slice(0, 7) }));
  const statusChart = aggregate("status").slice(0, 7);
  const organizationChart = aggregate("organization").slice(0, 8);
  const locationChart = aggregate("location").slice(0, 8);

  return <DashboardLayout><div dir="rtl" className="h-[calc(100vh-2rem)] overflow-hidden bg-[#f5f1e8] p-3 lg:p-4 text-slate-900">
    <header className="mb-2 flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#0b5d4d]"><span className="h-2 w-2 rounded-full bg-[#c9ab72]" /> مركز بيانات الموارد البشرية <ArrowUpLeft className="h-3.5 w-3.5" /></div><h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">لوحة حالة الموظفين</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">رؤية موحّدة لحالة القوة العاملة، التحديثات الشهرية، واستثناءات جودة البيانات.</p></div>
      <div className="flex items-center gap-3"><Badge variant="outline" className="rounded-full border-[#d8c398] bg-[#fbf6e9] px-3 py-1.5 text-[#0b5d4d]">آخر تحديث: آب 2026</Badge></div>
    </header>

    <div className="mb-3 grid grid-cols-4 gap-3"><SelectFilter value={month} setValue={setMonth} placeholder="كل الأشهر" options={data.facets.months} /><SelectFilter value={status} setValue={setStatus} placeholder="كل الحالات" options={data.facets.statuses} /><SelectFilter value={organization} setValue={setOrganization} placeholder="كل الجهات" options={data.facets.organizations} /><SelectFilter value={department} setValue={setDepartment} placeholder="كل الأقسام" options={data.facets.departments} /></div>
    <Tabs value={view} onValueChange={setView} className="space-y-3"><TabsList className="h-9 rounded-xl bg-slate-200/70 p-1"><TabsTrigger value="overview" className="rounded-lg px-5">نظرة عامة</TabsTrigger><TabsTrigger value="quality" className="rounded-lg px-5">جودة البيانات <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{nf.format(q.updatesMissingEmployee + q.employeesMissingUpdate)}</span></TabsTrigger></TabsList>
      <TabsContent value="overview" className="mt-0 space-y-3">
        <section className="grid grid-cols-4 gap-3"><MetricCard title="إجمالي الموظفين" value={kpis.totalEmployees} hint={`${nf.format(q.employeeCodes)} كوداً فريداً`} icon={Users} tone="bg-[#0b5d4d]" /><MetricCard title="سجلات التحديث" value={kpis.totalUpdates} hint={`${nf.format(q.updateCodes)} كوداً في التحديث`} icon={CalendarDays} tone="bg-[#c9ab72]" /><MetricCard title="الحالات النشطة" value={activeCount} hint="وفق آخر ملف تحديث" icon={Activity} tone="bg-[#9c6b35]" /><MetricCard title="استثناءات المطابقة" value={kpis.exceptions} hint={`${nf.format(q.duplicateUpdateCodes)} مجموعات مكررة`} icon={ShieldAlert} tone="bg-[#8d2638]" /></section>
        {chartsReady ? <section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]"><Card className="border-0 shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-base">حجم التحديثات حسب الشهر</CardTitle><p className="text-xs text-slate-400">عدد السجلات الواردة في كل شهر</p></CardHeader><CardContent className="h-24"><SafeChart><BarChart data={updateChart} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(v: number) => [nf.format(v), "السجلات"]} /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0b5d4d" /></BarChart></SafeChart></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-base">توزيع حالات التحديث</CardTitle><p className="text-xs text-slate-400">الحالة المسجلة في آخر ملف</p></CardHeader><CardContent className="h-24"><SafeChart><PieChart><Pie data={statusChart} dataKey="value" nameKey="label" innerRadius={56} outerRadius={88} paddingAngle={3}>{statusChart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: number, _: string, p: any) => [nf.format(v), label(p?.payload?.label)]} /></PieChart></SafeChart></CardContent></Card>
        <section className="grid gap-3 xl:grid-cols-2"><Distribution title="أعلى الجهات" data={organizationChart} /><Distribution title="توزيع مواقع العمل" data={locationChart} /></section></section> : <section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]"><div className="h-36 rounded-2xl bg-white/70" /><div className="h-36 rounded-2xl bg-white/70" /></section>}
      </TabsContent>
      <TabsContent value="quality" className="mt-0 space-y-3"><section className="grid grid-cols-4 gap-3"><MetricCard title="أكواد متطابقة" value={q.matchedCodes} hint="موجودة في المصدرين" icon={Users} tone="bg-[#0b5d4d]" /><MetricCard title="تحديثات بلا موظف" value={q.updatesMissingEmployee} hint="تحتاج مراجعة الربط" icon={ShieldAlert} tone="bg-[#8d2638]" /><MetricCard title="موظفون بلا تحديث" value={q.employeesMissingUpdate} hint="لم يظهروا في الملف الشهري" icon={CalendarDays} tone="bg-[#9c6b35]" /><MetricCard title="تكرار أكواد التحديث" value={q.duplicateUpdateCodes} hint="مجموعات تحتوي على تكرار" icon={Activity} tone="bg-[#c9ab72]" /></section><div className="grid gap-3 xl:grid-cols-2"><ExceptionCard title="تحديثات بلا موظف مطابق" items={data.exceptions.updatesMissingEmployee} /><ExceptionCard title="موظفون بلا تحديث شهري" items={data.exceptions.employeesMissingUpdate} /><ExceptionCard title="أكواد تحديث مكررة" items={data.exceptions.duplicateUpdateCodes} /><ExceptionCard title="أكواد موظفين مكررة" items={data.exceptions.duplicateEmployeeCodes} /></div></TabsContent>
    </Tabs>

    <p className="mt-2 text-center text-xs text-slate-400">لوحة إحصائية مجمّعة — لا تعرض أسماء أو سجلات فردية.</p>
  </div></DashboardLayout>;
}

function SafeChart({ children }: { children: React.ReactElement }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => setReady(host.clientWidth > 0 && host.clientHeight > 0);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return <div ref={hostRef} className="h-full min-w-0">{ready ? <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer> : null}</div>;
}

function SelectFilter({ value, setValue, placeholder, options }: { value: string; setValue: (v: string) => void; placeholder: string; options: { label: string; value: number }[] }) { return <select value={value} onChange={(e) => setValue(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-sm text-slate-600 outline-none focus:border-teal-500"> <option value="all">{placeholder}</option>{options.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}</select>; }
function Distribution({ title, data }: { title: string; data: { label: string; value: number }[] }) { return <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="h-24"><SafeChart><BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 8, bottom: 0 }}><CartesianGrid horizontal={false} stroke="#e2e8f0" /><XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(v: number) => [nf.format(v), "السجلات"]} /><Bar dataKey="value" fill="#0b5d4d" radius={[0, 5, 5, 0]} /></BarChart></SafeChart></CardContent></Card>; }
function ExceptionCard({ title, items }: { title: string; items: string[] }) { return <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><div className="max-h-72 space-y-2 overflow-y-auto">{items.slice(0, 100).map((item) => <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">{item || "بدون كود"}</div>)}{items.length > 100 && <p className="text-center text-xs text-slate-400">و {nf.format(items.length - 100)} سجلاً إضافياً</p>}</div></CardContent></Card>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-medium text-slate-700">{value}</p></div>; }
