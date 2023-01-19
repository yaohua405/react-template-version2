import QueryErrorContainer from "@common/atoms/QueryErrorContainer";
import React, { CSSProperties } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { SummaryItem, useApi_Summary } from "../../rxjs/observables";
// import { randomInt } from "crypto";
// import styles from "@common/styles/globals_export.scss";

// function randomInt(max, min = 0) {
// 	min = Math.ceil(min);
// 	max = Math.floor(max);
// 	return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
// }
// const names = ["Molina", "Ambetter", "Oscar", "Carrier0", "Carrier1"];
// const testData = [5, 6, 5, 3].map((v, i) => ({ v, name: names[i] }));
// let policiesData = [
// 	{ name: "Ambetter", members: randomInt(1000), policies: randomInt(1000) },
// 	{ name: "Oscar", members: randomInt(1000), policies: randomInt(1000) },
// 	{ name: "BEBS", members: randomInt(1000), policies: randomInt(1000) },
// 	{ name: "Bright", members: randomInt(1000), policies: randomInt(1000) },
// 	{ name: "Molina", members: randomInt(1000), policies: randomInt(1000) },
// ];

// // policiesData = policiesData.map(p => {p['percent'] = p.policies / totals.policies;return p})
// const totals = policiesData.reduce(
// 	(t, p) => {
// 		t.members += p.members;
// 		t.policies += p.policies;
// 		return t;
// 	},
// 	{ members: 0, policies: 0 }
// );
// policiesData = policiesData.map((p) => {
// 	p["percent"] = Math.floor((p.policies / totals.policies) * 1000) / 10;
// 	return p;
// });
// const policiesDataTotals = JSON.parse(JSON.stringify(policiesData));
// policiesDataTotals.push({ name: "Totals", members: totals.members, policies: totals.policies });

// const policiesTime = [] as any[];
// for (let i = 0; i < 10; i++) {
// 	if (i !== 9) policiesTime.push({ policies: randomInt(10000) });
// 	else policiesTime.push({ policies: totals.policies });
// }
// console.log(policiesTime);

var monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];
const InfoContainer = ({ style, className, children, ...props }: any) => {
	return (
		<div
			className={`card padding-0 ${className}`}
			style={{ position: "relative", textAlign: "center", height: 400, minWidth: 200, flex: "1 1 400px", ...style }}
			{...props}
		>
			{children}
		</div>
	);
};
type PoliciesMembers = { policies: number; members: number };
const Dashboard = (props) => {
	// * Digest Summary data by turning it into something we can show in the UI
	const summary = useApi_Summary();
	const year = new Date().getFullYear();
	// ! Data last month for test
	const month = new Date().getMonth() - 1;
	// Policies by carrier this month, displayed in
	let carrierMonth: (PoliciesMembers & { carrierName: string })[] = [];
	let dataMonth: (PoliciesMembers & { month: number })[] = [];
	// Array of carriers and their data this year
	let dataThisYear: (PoliciesMembers & { carrierName: string })[] = [];
	let dataYearMonthly: (PoliciesMembers & { month: number | string; monthClipped?: string })[] = [];
	const add = <T, E>(
		from: Array<T>,
		to: Array<E>,
		k: string,
		assert: (v: T) => boolean,
		onMatch: (fi: T, ti: E) => void,
		defaultItem: (v: T) => E
	) => {
		from.forEach((fi) => {
			if (assert(fi)) {
				let item = to.find((d) => d[k] === fi[k]);
				if (!item) {
					item = defaultItem(fi);
					to.push(item);
				}
				onMatch(fi, item);
			}
		});
	};
	if (summary && summary["data"]) {
		const summary_data = summary["data"] as SummaryItem[];
		add(
			summary_data,
			dataThisYear,
			"carrierName",
			(v) => v.year === year,
			(si, yi) => {
				yi.members += si.members;
				yi.policies += si.policies;
			},
			(v) => ({ carrierName: v.carrierName, policies: 0, members: 0 })
		);
		add(
			summary_data,
			carrierMonth,
			"carrierName",
			(v) => v.year === year && v.month === month,
			(si, yi) => {
				yi.members += si.members;
				yi.policies += si.policies;
			},
			(v) => ({ carrierName: v.carrierName, policies: 0, members: 0 })
		);
		add(
			summary_data,
			dataMonth,
			"month",
			(v) => v.year === year && v.month === month,
			(si, yi) => {
				yi.members += si.members;
				yi.policies += si.policies;
			},
			(v) => ({ month: v.month, policies: 0, members: 0 })
		);
		add(
			summary_data,
			dataYearMonthly,
			"month",
			(v) => v.year === year,
			(si, yi) => {
				yi.members += si.members;
				yi.policies += si.policies;
			},
			(v) => ({ month: v.month, policies: 0, members: 0 })
		);
	}
	// Filling in the months in yearMonthly
	for (let i = 0; i < 12; ++i) {
		if (!dataYearMonthly.find((p) => p.month === i)) dataYearMonthly.push({ month: i, members: 0, policies: 0 });
	}
	dataYearMonthly.sort((a, b) => Number(a.month) - Number(b.month));
	dataYearMonthly.forEach((v) => {
		const mn = monthNames[v.month] as string;
		// v.month = mn;
		v.monthClipped = mn.substr(0, 3);
	});
	// * -----------------------------------------

	// console.log(summary);
	console.log(carrierMonth);
	const centerSyle: CSSProperties = {
		position: "absolute",
		textAlign: "center",
		top: "50%",
		left: "50%",
		transform: "translate(-50%,-50%)",
	};
	return (
		<QueryErrorContainer
			response={summary}
			childrenDefault={"This is the dashboard, select an agent on the side to view their stats"}
			minHeight={400}
		>
			{() => (
				<>
					<div style={{ display: "flex", flexFlow: "row wrap", gap: "1em" }} className='padding-4'>
						{/* <ResponsiveContainer width="100%" height="400px"> */}
						<InfoContainer>
							<div style={{ ...centerSyle, width: "30%" }}>Yearly Sales</div>
							<ResponsiveContainer width='100%' height='100%'>
								<PieChart width={400} height={400}>
									<defs>
										<linearGradient id='colorUv' x1='0' y1='0' x2='0' y2='1'>
											<stop offset='5%' stopColor='#129a74' stopOpacity={0.8} />
											<stop offset='95%' stopColor='#129a74' stopOpacity={0} />
										</linearGradient>
									</defs>
									{/* <Legend /> */}
									<Pie
										data={dataThisYear}
										dataKey='policies'
										innerRadius='30%'
										outerRadius='50%'
										nameKey='carrierName'
										fill='#7B54A3'
									/>

									<Pie
										data={dataThisYear}
										dataKey='members'
										nameKey='carrierName'
										innerRadius='60%'
										outerRadius='75%'
										fill='#DF5395'
										label
									/>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</InfoContainer>
						<InfoContainer>
							<h2 style={{ textAlign: "center" }}>Yearly Sales</h2>
							<ResponsiveContainer>
								<ComposedChart
									width={600}
									height={400}
									data={dataYearMonthly}
									margin={{
										top: 40,
										right: 30,
										bottom: 90,
										left: 0,
									}}
								>
									<CartesianGrid stroke='#808080a3' />
									<XAxis dataKey='monthClipped' />
									<YAxis />
									<Tooltip />
									<Legend style={{ bottom: 70 }} />
									<Bar dataKey='policies' barSize={20} fill='#7B54A3' />
									<Line type='monotone' dataKey='members' stroke='#DF5395' />
								</ComposedChart>
							</ResponsiveContainer>
							{/* <div style={{ ...centerSyle}}>This year</div> */}
						</InfoContainer>
						<InfoContainer>
							<h2 style={{ textAlign: "center" }}>Last Month's Sales</h2>
							{/* <div style={{ position: "relative", flex:'1 1 auto', minHeight:200}}> */}
							{(dataMonth.length && (
								<ResponsiveContainer>
									<BarChart
										// key={JSON.stringify(dataMonth)}
										// width={600}
										margin={{
											top: 40,
											right: 30,
											bottom: 90,
											left: 0,
										}}
										// height={400}
										data={carrierMonth}
									>
										<CartesianGrid stroke='#808080a3' />
										<XAxis dataKey='carrierName' />
										<YAxis />
										<Tooltip />
										<Legend />
										<Bar dataKey='members' fill='#DF5395' />
										<Bar dataKey='policies' fill='#7B54A3' />
									</BarChart>
								</ResponsiveContainer>
							)) || <div style={centerSyle}>No data this month</div>}
							{/* </div> */}
						</InfoContainer>
						{/* <InfoContainer>
				<Table
					options={{
						columns: columnsQuick("name,Carrier;members,Members;policies,Policies;percent, %"),
						data: policiesDataTotals,
					}}
				/>
			</InfoContainer> */}
						{/* </ResponsiveContainer> */}{" "}
					</div>
				</>
			)}
		</QueryErrorContainer>
	);
};

export default Dashboard;
