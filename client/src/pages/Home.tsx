import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { filterCurrentEmployeeRecords } from "@shared/dashboard-utils";
import { buildFilteredMovementChart, countFilteredDirectorates, filterPublicUpdates, getDepartmentsForDirectorate, getSalaryForMonth, normalizePublicText, PUBLIC_FIXED_WIDGET_LABEL } from "@shared/public-filter-utils";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, WalletCards, MapPinned, GraduationCap, Building2, GitBranch, ArrowUpLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#0b5d4d", "#c9ab72", "#8d2638", "#33423f", "#9c6b35", "#66736f", "#e3d7bd"];
const nf = new Intl.NumberFormat("en-US");
const label = (value: string) => value || "غير محدد";

type MetricProps = { title: string; value: number | string; hint: string; icon: typeof Users; tone: string };

type SelectOption = { label: string; value: number };

function MetricCard({ title, value, hint, icon: Icon, tone }: MetricProps) {
  return <Card className="relative min-w-0 overflow-hidden border-0 bg-white/95 shadow-sm">
    <div className={`absolute inset-y-0 right-0 w-1 ${tone}`} />
    <CardContent className="p-3"><div className="flex items-start justify-between gap-2">
      <div className="min-w-0"><p className="truncate text-xs text-slate-500">{title}</p><p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">{typeof value === "number" ? nf.format(value) : value}</p><p className="mt-1 truncate text-[11px] text-slate-400">{hint}</p></div>
      <div className="rounded-2xl bg-[#0b5d4d]/10 p-2.5"><Icon className="h-5 w-5 text-[#0b5d4d]" /></div>
    </div></CardContent>
  </Card>;
}

export default function Home() {
  const { data, isLoading, error } = trpc.dashboard.overview.useQuery();
  const [month, setMonth] = useState("all");
  const [directorate, setDirectorate] = useState("all");
  const [department, setDepartment] = useState("all");
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => { const frame = requestAnimationFrame(() => setChartsReady(true)); return () => cancelAnimationFrame(frame); }, []);

  const hierarchy = useMemo(() => ((data?.facets as any)?.departmentsByDirectorate ?? {}) as Record<string, string[]>, [data]);
  const monthOptions = useMemo(() => uniqueOptions((data?.facets?.months ?? []).map((option: any) => String(option.label ?? "").slice(0, 7))), [data]);
  const directorateOptions = useMemo(() => {
    const hierarchyNames = Object.keys(hierarchy);
    const employeeNames = (data?.employees ?? []).map((row: any) => row.directorate).filter(Boolean);
    const updateNames = (data?.updates ?? []).map((row: any) => row.organization).filter(Boolean);
    const names = uniqueLabels([...hierarchyNames, ...employeeNames, ...updateNames]);
    return uniqueOptions(names.length ? names : (data?.facets?.organizations ?? []).map((option: any) => option.label));
  }, [data, hierarchy]);
  const departmentOptions = useMemo(() => {
    if (!data) return [];
    const observedDepartments = [...(data.employees ?? []).filter((row: any) => directorate === "all" || normalizePublicText(row.directorate) === normalizePublicText(directorate)).map((row: any) => row.department), ...(data.updates ?? []).filter((row: any) => directorate === "all" || normalizePublicText(row.organization) === normalizePublicText(directorate)).map((row: any) => row.department)];
    const allDepartments = directorate === "all" ? (data.facets?.departments ?? []).map((option: any) => option.label) : [];
    return uniqueOptions(getDepartmentsForDirectorate(hierarchy, directorate, [...observedDepartments, ...allDepartments]));
  }, [data, directorate, hierarchy]);

  useEffect(() => {
    if (department !== "all" && !departmentOptions.some((option) => normalizePublicText(option.label) === normalizePublicText(department))) setDepartment("all");
  }, [department, departmentOptions]);

  const filtered = useMemo(() => data ? filterCurrentEmployeeRecords(data.reconciled as any, { directorate, department }) : [], [data, directorate, department]);
  const latestUpdates = useMemo(() => filtered.map((record: any) => record.latestUpdate).filter(Boolean), [filtered]);
  const scopedUpdates = useMemo(() => filterPublicUpdates(data?.updates ?? [], { directorate, department }), [data, directorate, department]);
  const metrics = data?.publicMetrics ?? { totalSalaries: 0, salaryByMonth: [], salarySource: "", centers: 0, trainingAttendance: null, trainingAttendanceLabel: "بانتظار ملف بيانات التدريب" };
  const directorateCounts = useMemo(() => countFilteredDirectorates(filtered), [filtered]);
  const aggregate = (key: string) => Object.entries(latestUpdates.reduce((acc: Record<string, number>, item: any) => { const value = item?.[key] || "غير محدد"; acc[value] = (acc[value] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value: value as number })).sort((a, b) => b.value - a.value);
  const statusChart = useMemo(() => aggregate("status").slice(0, 7), [latestUpdates]);
  const months = useMemo(() => (data?.publicMetrics?.newContractsByMonth ?? data?.facets?.months ?? []).map((row: any) => String(row.month ?? row.label ?? "").slice(0, 7)).filter(Boolean), [data]);
  const movementChart = useMemo(() => buildFilteredMovementChart(scopedUpdates, months, { month: "all", directorate, department }), [scopedUpdates, months, directorate, department]);
  const salaryValue = getSalaryForMonth(metrics, month);
  const salaryHint = month === "all" ? "إجمالي المصدر — كل الأشهر" : `الشهر المالي ${month} — يتأثر بفلتر الأشهر`;
  const currentHint = "حسب المديرية والقسم — لا يتأثر بفلتر الأشهر";

  if (isLoading) return <DashboardLayout><div className="p-8 text-center text-slate-500">جارٍ تحميل بيانات الصفحة العامة...</div></DashboardLayout>;
  if (error || !data) return <DashboardLayout><div className="p-8 text-center text-red-600">تعذر تحميل بيانات اللوحة. يرجى إعادة المحاولة.</div></DashboardLayout>;

  return <DashboardLayout><div dir="rtl" className="min-h-[calc(100vh-2rem)] bg-[#f5f1e8] p-3 text-slate-900 lg:p-4">
    <header className="mb-2 flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#0b5d4d]"><span className="h-2 w-2 rounded-full bg-[#c9ab72]" /> مركز بيانات الموارد البشرية <ArrowUpLeft className="h-3.5 w-3.5" /></div><h1 className="text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">الصفحة العامة للقوة العاملة</h1><p className="mt-1 text-sm text-slate-500">ملخص تنفيذي للموظفين والرواتب والمراكز والحركات الشهرية.</p></div><Badge variant="outline" className="w-fit rounded-full border-[#d8c398] bg-[#fbf6e9] px-3 py-1.5 text-[#0b5d4d]">آخر شهر مالي: {String(metrics.salarySource ?? "").includes("المالي") ? "متاح" : "غير محدد"}</Badge></header>

    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3"><SelectFilter value={month} setValue={setMonth} placeholder="كل الأشهر" options={monthOptions} /><SelectFilter value={directorate} setValue={(value) => { setDirectorate(value); setDepartment("all"); }} placeholder="كل المديريات" options={directorateOptions} /><SelectFilter value={department} setValue={setDepartment} placeholder="كل الأقسام" options={departmentOptions} /></div>

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricCard title="عدد الموظفين الحاليين" value={directorateCounts.current} hint={currentHint} icon={Users} tone="bg-[#0b5d4d]" /><MetricCard title="مجموع الرواتب" value={salaryValue} hint={salaryHint} icon={WalletCards} tone="bg-[#c9ab72]" /><MetricCard title="عدد المراكز" value={metrics.centers} hint={PUBLIC_FIXED_WIDGET_LABEL} icon={MapPinned} tone="bg-[#9c6b35]" /><MetricCard title="حضور التدريبات" value={metrics.trainingAttendance ?? "بانتظار الملف"} hint={`${metrics.trainingAttendanceLabel} — ${PUBLIC_FIXED_WIDGET_LABEL}`} icon={GraduationCap} tone="bg-[#8d2638]" /></section>

    <section className="mt-3 grid gap-3 lg:grid-cols-4"><Card className="border-0 bg-white/95 shadow-sm"><CardHeader className="pb-1"><CardTitle className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-[#0b5d4d]" /> المديريات المركزية</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{nf.format(directorateCounts.central)}</p><p className="mt-1 text-[11px] text-slate-400">حسب المديرية والقسم — لا يتأثر بفلتر الأشهر</p></CardContent></Card><Card className="border-0 bg-white/95 shadow-sm"><CardHeader className="pb-1"><CardTitle className="flex items-center gap-2 text-sm"><GitBranch className="h-4 w-4 text-[#8d2638]" /> المديريات الفرعية</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{nf.format(directorateCounts.branch)}</p><p className="mt-1 text-[11px] text-slate-400">حسب المديرية والقسم — لا يتأثر بفلتر الأشهر</p></CardContent></Card><Card className="border-0 bg-white/95 shadow-sm lg:col-span-2"><CardHeader className="pb-1"><CardTitle className="text-sm">اتجاه الحركة الشهرية</CardTitle><p className="text-[11px] text-slate-400">لا يتأثر بفلتر الأشهر؛ يتبع فلتر المديرية والقسم</p></CardHeader><CardContent className="h-20"><SafeChart><ComposedChart data={movementChart} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number, name: string) => [nf.format(value), name === "contracts" ? "تعاقدات جديدة" : "انفكاكات"]} /><Line type="monotone" dataKey="contracts" stroke="#0b5d4d" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="separations" stroke="#8d2638" strokeWidth={2} dot={false} /></ComposedChart></SafeChart></CardContent></Card></section>

    {chartsReady ? <section className="mt-3 grid gap-3 lg:grid-cols-2"><Card className="border-0 bg-white/95 shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-sm">النقل حسب النوع والحالة</CardTitle><p className="text-[11px] text-slate-400">لا يتأثر بفلتر الأشهر؛ خارجي + نقل من = إلى الجمارك، خارجي + نقل إلى = خارج الجمارك، والداخلي مستقل عن الحالة</p></CardHeader><CardContent className="h-40"><SafeChart><BarChart data={movementChart} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value: number, name: string) => [nf.format(value), name === "transfersIn" ? "نقل إلى الجمارك" : name === "transfersOut" ? "نقل خارج الجمارك" : "نقل داخلي"]} /><Bar dataKey="transfersIn" fill="#c9ab72" radius={[4, 4, 0, 0]} /><Bar dataKey="transfersOut" fill="#33423f" radius={[4, 4, 0, 0]} /><Bar dataKey="transfersInternal" fill="#0b5d4d" radius={[4, 4, 0, 0]} /></BarChart></SafeChart></CardContent></Card><Card className="border-0 bg-white/95 shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-sm">توزيع حالات الموظفين</CardTitle><p className="text-[11px] text-slate-400">حسب آخر حالة تحديث مدمجة ضمن نطاق المديرية والقسم</p></CardHeader><CardContent className="h-40"><SafeChart><PieChart><Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={45} outerRadius={68} paddingAngle={3}>{statusChart.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(value: number, _: string, payload: any) => [nf.format(value), label(payload?.payload?.name)]} /></PieChart></SafeChart></CardContent></Card></section> : null}

    <section className="mt-3 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]"><Card className="border-0 bg-white/95 shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-sm">خريطة مراكز العمل</CardTitle><p className="text-[11px] text-slate-400">{PUBLIC_FIXED_WIDGET_LABEL}؛ المديريات والمفارز المسجلة بإحداثيات</p></CardHeader><CardContent className="p-0"><WorkLocationMap locations={data.workLocations} /></CardContent></Card><Card className="border-0 bg-white/95 shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-sm">ملخص نطاق الفلاتر</CardTitle><p className="text-[11px] text-slate-400">تُطبّق الفلاتر على العدد الحالي واتجاه الحركة والنقل. الرواتب تتبع الشهر، بينما المراكز والتدريب والخريطة إجماليات مصدرية.</p></CardHeader><CardContent className="flex h-64 items-center justify-center text-center"><div><p className="text-4xl font-bold text-[#0b5d4d]">{nf.format(filtered.length)}</p><p className="mt-2 text-xs text-slate-500">سجلات ضمن نطاق المديرية والقسم</p><p className="mt-1 text-[11px] text-slate-400">العدد الحالي فقط يُحتسب من ملفات الموظفين الفعالة</p></div></CardContent></Card></section>

    <p className="mt-2 text-center text-[11px] text-slate-400">لوحة إحصائية مجمّعة — لا تعرض أسماء أو سجلات فردية. فلتر الشهر يؤثر على الرواتب فقط؛ اتجاه الحركة والنقل والعدد الحالي لا تتأثر به.</p>
  </div></DashboardLayout>;
}


function uniqueLabels(values: unknown[]) {
  const seen = new Set<string>();
  return values.map((value) => String(value ?? "").trim()).filter((value) => value && !seen.has(normalizePublicText(value)) && seen.add(normalizePublicText(value)));
}

function uniqueOptions(values: unknown[]): SelectOption[] {
  return uniqueLabels(values).map((label) => ({ label, value: 0 }));
}

function SafeChart({ children }: { children: React.ReactElement }) { const hostRef = useRef<HTMLDivElement>(null); const [ready, setReady] = useState(false); useEffect(() => { const host = hostRef.current; if (!host) return; const update = () => setReady(host.clientWidth > 0 && host.clientHeight > 0); update(); const observer = new ResizeObserver(update); observer.observe(host); return () => observer.disconnect(); }, []); return <div ref={hostRef} className="h-full min-w-0">{ready ? <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer> : null}</div>; }

function SelectFilter({ value, setValue, placeholder, options }: { value: string; setValue: (v: string) => void; placeholder: string; options: SelectOption[] }) { return <select value={value} onChange={(e) => setValue(e.target.value)} className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-right text-xs text-slate-600 outline-none focus:border-[#0b5d4d]"><option value="all">{placeholder}</option>{options.map((option) => <option key={option.label} value={option.label}>{option.label}</option>)}</select>; }

function WorkLocationMap({ locations }: { locations: { name: string; governorate: string; latitude: number; longitude: number; employeeCount: number }[] }) {
  return <div className="relative h-64 overflow-hidden rounded-b-xl bg-[#e8e2d5] p-4"><div className="absolute inset-x-4 top-3 flex items-center justify-between text-xs text-[#0b5d4d]"><span className="font-semibold">خريطة إحداثية لمواقع المراكز</span><span>{nf.format(locations.length)} موقعاً</span></div>{locations.map((location) => { const left = Math.max(4, Math.min(94, ((location.longitude - 35) / 8) * 100)); const top = Math.max(12, Math.min(90, ((38 - location.latitude) / 6) * 100)); return <div key={`${location.name}-${location.latitude}`} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${left}%`, top: `${top}%` }} title={`${location.name} — ${nf.format(location.employeeCount)} موظف`}><span className="block h-3 w-3 rounded-full border-2 border-white bg-[#0b5d4d] shadow-md" /><span className="pointer-events-none absolute bottom-4 right-1/2 hidden w-40 translate-x-1/2 rounded-lg bg-[#0b5d4d] px-2 py-1 text-center text-[10px] text-white group-hover:block">{location.name}<br />{nf.format(location.employeeCount)} موظف</span></div>; })}</div>;
}
