# Visual verification — public filter revision

- Desktop `/` at 1280×720 rendered the public overview with exactly three filters: month, directorate, and department.
- The status filter is absent from the visible filter row.
- The current employees, central directorates, and branch directorates cards show scope text stating they are not affected by the month filter.
- The salary card displays the source-wide amount for all months and the movement/transfer panels are visible below.
- The movement chart remains a full monthly series rather than collapsing to the selected month.
- Desktop `/hr` remained rendered with its existing statistical layout.
- No clipping or browser console error was observed in the inspected logs; a second screenshot is planned at landscape-tablet width.

المعاينة الأخيرة على سطح المكتب 1280×720 أظهرت مخططي «المديريات المركزية» و«المديريات الفرعية» بأشرطة أفقية وأسماء المديريات وأعدادها، مع الحفاظ على تخطيط RTL العام. تم وضع الرسم داخل مساحة تمرير داخلية عند كثرة المديريات لتجنب تمدد الصفحة بالكامل.

المعاينة الأفقية الأخيرة على 1024×768 بعد تعديل مخططات المديريات أظهرت مخططي المركزية والفرعية داخل التخطيط دون قص أفقي أو تداخل، مع ظهور أسماء المديريات والأشرطة، ووجود التمرير الداخلي للمخطط عند الحاجة ضمن RTL.
