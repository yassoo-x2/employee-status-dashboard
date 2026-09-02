import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { calculateKpis, filterDashboardRecords } from "@shared/dashboard-utils";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Activity, CalendarDays, ShieldAlert, Search, RotateCcw, ArrowUpLeft, ChevronLeft } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#0f766e", "#d97706", "#2563eb", "#be123c", "#7c3aed", "#64748b", "#0e7490"];
const nf = new Intl.NumberFormat("ar-EG");
const label = (value: string) => value || "غير محدد";

function MetricCard({ title, value, hint, icon: Icon, tone }: { title: string; value: number; hint: string; icon: typeof Users; tone: string }) {
  return <Card className="relative overflow-hidden border-0 shadow-sm bg-white/90">
    <div className={`absolute inset-y-0 right-0 w-1 ${tone}`} />
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{nf.format(value)}</p><p className="mt-2 text-xs text-slate-400">{hint}</p></div>
        <div className={`rounded-2xl p-3 ${tone.replace("bg-", "bg-")}/10`}><Icon className="h-5 w-5 text-teal-700" /></div>
      </div>
    </CardContent>
  </Card>;
}

export default function Home() {
  const { data, isLoading, error } = trpc.dashboard.overview.useQuery();
  const [view, setView] = useState("overview");
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("all");
  const [status, setStatus] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [department, setDepartment] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setChartsReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return filterDashboardRecords(data.reconciled as any, { query: q, month, status, organization, department });
  }, [data, query, month, status, organization, department]);

  const reset = () => { setQuery(""); setMonth("all"); setStatus("all"); setOrganization("all"); setDepartment("all"); };
  if (isLoading) return <DashboardLayout><div className="p-8 text-center text-slate-500">جارٍ تحميل بيانات الموظفين...</div></DashboardLayout>;
  if (error || !data) return <DashboardLayout><div className="p-8 text-center text-red-600">تعذر تحميل بيانات اللوحة. يرجى تسجيل الدخول أو إعادة المحاولة.</div></DashboardLayout>;
  const q = data.quality;
  const kpis = calculateKpis(q);
  const activeCount = (data.facets.statuses.find((x: any) => /على رأس|على راس|مباشر|فعال|قائم/.test(x.label))?.value ?? 0);
  const updateChart = data.facets.months.slice().reverse().map((x: any) => ({ ...x, name: x.label?.slice(0, 7) }));

  return <DashboardLayout><div dir="rtl" className="min-h-screen bg-[#f5f7f7] -m-4 p-5 lg:p-8 text-slate-900">
    <header className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold text-teal-700"><span className="h-2 w-2 rounded-full bg-teal-500" /> مركز بيانات الموارد البشرية <ArrowUpLeft className="h-3.5 w-3.5" /></div><h1 className="text-3xl font-bold tracking-tight text-slate-950 lg:text-4xl">لوحة حالة الموظفين</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">رؤية موحّدة لحالة القوة العاملة، التحديثات الشهرية، واستثناءات جودة البيانات.</p></div>
      <div className="flex items-center gap-3"><Badge variant="outline" className="rounded-full border-teal-200 bg-teal-50 px-3 py-1.5 text-teal-800">آخر تحديث: آب 2026</Badge><Button variant="outline" onClick={reset} className="gap-2 rounded-xl bg-white"><RotateCcw className="h-4 w-4" /> إعادة ضبط</Button></div>
    </header>

    <Tabs value={view} onValueChange={setView} className="space-y-6"><TabsList className="h-11 rounded-xl bg-slate-200/70 p-1"><TabsTrigger value="overview" className="rounded-lg px-5">نظرة عامة</TabsTrigger><TabsTrigger value="quality" className="rounded-lg px-5">جودة البيانات <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{nf.format(q.updatesMissingEmployee + q.employeesMissingUpdate)}</span></TabsTrigger></TabsList>
      <TabsContent value="overview" className="mt-0 space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard title="إجمالي الموظفين" value={kpis.totalEmployees} hint={`${nf.format(q.employeeCodes)} كوداً فريداً`} icon={Users} tone="bg-teal-600" /><MetricCard title="سجلات التحديث" value={kpis.totalUpdates} hint={`${nf.format(q.updateCodes)} كوداً في التحديث`} icon={CalendarDays} tone="bg-blue-600" /><MetricCard title="الحالات النشطة" value={activeCount} hint="وفق آخر ملف تحديث" icon={Activity} tone="bg-amber-500" /><MetricCard title="استثناءات المطابقة" value={kpis.exceptions} hint={`${nf.format(q.duplicateUpdateCodes)} مجموعات مكررة`} icon={ShieldAlert} tone="bg-rose-600" /></section>
        {chartsReady ? <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><Card className="border-0 shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-base">حجم التحديثات حسب الشهر</CardTitle><p className="text-xs text-slate-400">عدد السجلات الواردة في كل شهر</p></CardHeader><CardContent className="h-72"><SafeChart><BarChart data={updateChart} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}><CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(v: number) => [nf.format(v), "السجلات"]} /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0f766e" /></BarChart></SafeChart></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardHeader className="pb-1"><CardTitle className="text-base">توزيع حالات التحديث</CardTitle><p className="text-xs text-slate-400">الحالة المسجلة في آخر ملف</p></CardHeader><CardContent className="h-72"><SafeChart><PieChart><Pie data={data.facets.statuses.slice(0, 7)} dataKey="value" nameKey="label" innerRadius={56} outerRadius={88} paddingAngle={3}>{data.facets.statuses.slice(0, 7).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: number, _: string, p: any) => [nf.format(v), label(p?.payload?.label)]} /></PieChart></SafeChart></CardContent></Card>
        <section className="grid gap-5 xl:grid-cols-2"><Distribution title="أعلى الجهات" data={data.facets.organizations.slice(0, 8)} /><Distribution title="توزيع مواقع العمل" data={data.facets.locations.slice(0, 8)} /></section></section> : <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div className="h-72 rounded-2xl bg-white/70" /><div className="h-72 rounded-2xl bg-white/70" /></section>}
      </TabsContent>
      <TabsContent value="quality" className="mt-0 space-y-6"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard title="أكواد متطابقة" value={q.matchedCodes} hint="موجودة في المصدرين" icon={Users} tone="bg-teal-600" /><MetricCard title="تحديثات بلا موظف" value={q.updatesMissingEmployee} hint="تحتاج مراجعة الربط" icon={ShieldAlert} tone="bg-rose-600" /><MetricCard title="موظفون بلا تحديث" value={q.employeesMissingUpdate} hint="لم يظهروا في الملف الشهري" icon={CalendarDays} tone="bg-amber-500" /><MetricCard title="تكرار أكواد التحديث" value={q.duplicateUpdateCodes} hint="مجموعات تحتوي على تكرار" icon={Activity} tone="bg-blue-600" /></section><div className="grid gap-5 xl:grid-cols-2"><ExceptionCard title="تحديثات بلا موظف مطابق" items={data.exceptions.updatesMissingEmployee} /><ExceptionCard title="موظفون بلا تحديث شهري" items={data.exceptions.employeesMissingUpdate} /><ExceptionCard title="أكواد تحديث مكررة" items={data.exceptions.duplicateUpdateCodes} /><ExceptionCard title="أكواد موظفين مكررة" items={data.exceptions.duplicateEmployeeCodes} /></div></TabsContent>
    </Tabs>

    <section className="mt-7 rounded-2xl bg-white p-5 shadow-sm"><div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center"><div><h2 className="text-lg font-bold">سجل الموظفين والتحديثات</h2><p className="mt-1 text-xs text-slate-400">{nf.format(filtered.length)} نتيجة • اضغط على أي صف للتفاصيل وسجل الحركات</p></div><div className="relative w-full lg:w-80"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو الكود..." className="h-10 rounded-xl border-slate-200 pr-10 text-right" /></div></div><div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><SelectFilter value={month} setValue={setMonth} placeholder="كل الأشهر" options={data.facets.months} /><SelectFilter value={status} setValue={setStatus} placeholder="كل الحالات" options={data.facets.statuses} /><SelectFilter value={organization} setValue={setOrganization} placeholder="كل الجهات" options={data.facets.organizations} /><SelectFilter value={department} setValue={setDepartment} placeholder="كل الأقسام" options={data.facets.departments} /></div><div className="overflow-x-auto rounded-xl border border-slate-100"><table className="w-full min-w-[900px] text-right text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3 font-medium">الموظف</th><th className="px-4 py-3 font-medium">الكود</th><th className="px-4 py-3 font-medium">الجهة / القسم</th><th className="px-4 py-3 font-medium">آخر شهر</th><th className="px-4 py-3 font-medium">الحالة</th><th className="px-4 py-3 font-medium">الربط</th><th /></tr></thead><tbody className="divide-y divide-slate-100">{filtered.slice(0, 100).map((record: any, i: number) => <tr key={`${record.code}-${i}`} className="transition-colors hover:bg-teal-50/50"><td className="px-4 py-3 font-semibold text-slate-800">{record.employee?.name || record.latestUpdate?.name || "بدون اسم"}</td><td className="px-4 py-3 font-mono text-xs text-slate-500">{record.code || "بدون كود"}</td><td className="px-4 py-3 text-slate-600">{record.employee?.organization || record.latestUpdate?.organization || "—"}<span className="block text-xs text-slate-400">{record.employee?.department || record.latestUpdate?.department || "—"}</span></td><td className="px-4 py-3 text-slate-600">{record.latestUpdate?.month || "—"}</td><td className="px-4 py-3">{record.latestUpdate ? <Badge className="rounded-full bg-slate-100 font-normal text-slate-700 hover:bg-slate-100">{label(record.latestUpdate.status)}</Badge> : <span className="text-slate-400">لا يوجد</span>}</td><td className="px-4 py-3"><Badge variant="outline" className={record.matchStatus === "matched" ? "border-teal-200 text-teal-700" : "border-amber-200 text-amber-700"}>{record.matchStatus === "matched" ? "متطابق" : record.matchStatus === "update_only" ? "تحديث فقط" : record.matchStatus === "employee_only" ? "موظف فقط" : "كود مفقود"}</Badge></td><td className="px-4"><button type="button" onClick={() => setSelected(record)} className="rounded-lg p-2 text-slate-400 hover:bg-teal-100 hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600" aria-label={`عرض تفاصيل ${record.employee?.name || record.latestUpdate?.name || record.code}`}><ChevronLeft className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>{filtered.length > 100 && <p className="mt-3 text-center text-xs text-slate-400">يتم عرض أول 100 نتيجة. استخدم الفلاتر لتضييق النتائج.</p>}</section>
    <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}><DialogContent dir="rtl" className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{selected?.employee?.name || selected?.latestUpdate?.name || "تفاصيل السجل"}</DialogTitle></DialogHeader>{selected && <div className="space-y-5 text-sm"><div className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"><Detail label="الكود" value={selected.code || "غير متوفر"} /><Detail label="الحالة الوظيفية" value={selected.employee?.workStatus || "—"} /><Detail label="الجهة" value={selected.employee?.organization || selected.latestUpdate?.organization || "—"} /><Detail label="مكان العمل" value={selected.employee?.location || selected.latestUpdate?.location || "—"} /><Detail label="القسم" value={selected.employee?.department || selected.latestUpdate?.department || "—"} /><Detail label="المنصب" value={selected.employee?.positionDetail || selected.latestUpdate?.roleDetail || "—"} /></div><div><h3 className="mb-3 font-bold">آخر تحديث</h3>{selected.latestUpdate ? <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4"><div className="flex flex-wrap gap-2"><Badge>{selected.latestUpdate.status}</Badge><Badge variant="outline">{selected.latestUpdate.month || "بدون شهر"}</Badge></div><p className="mt-3 text-slate-600">{selected.latestUpdate.note || selected.latestUpdate.statement || "لا توجد ملاحظات مسجلة."}</p></div> : <p className="text-slate-400">لا يوجد تحديث شهري مرتبط.</p>}</div><div><h3 className="mb-3 font-bold">سجل الحركات ({nf.format(selected.movementHistory.length)})</h3><div className="space-y-2">{selected.movementHistory.map((item: any) => <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"><span>{item.month || "—"}</span><span className="text-slate-500">{item.status}</span></div>)}</div></div></div>}</DialogContent></Dialog>
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
function Distribution({ title, data }: { title: string; data: { label: string; value: number }[] }) { return <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent className="h-72"><SafeChart><BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 8, bottom: 0 }}><CartesianGrid horizontal={false} stroke="#e2e8f0" /><XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(v: number) => [nf.format(v), "السجلات"]} /><Bar dataKey="value" fill="#0f766e" radius={[0, 5, 5, 0]} /></BarChart></SafeChart></CardContent></Card>; }
function ExceptionCard({ title, items }: { title: string; items: string[] }) { return <Card className="border-0 shadow-sm"><CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader><CardContent><div className="max-h-72 space-y-2 overflow-y-auto">{items.slice(0, 100).map((item) => <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">{item || "بدون كود"}</div>)}{items.length > 100 && <p className="text-center text-xs text-slate-400">و {nf.format(items.length - 100)} سجلاً إضافياً</p>}</div></CardContent></Card>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-medium text-slate-700">{value}</p></div>; }
