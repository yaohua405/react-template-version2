import Button from "@common/atoms/Button";
import Dropdown from "@common/atoms/Dropdown";
import Field from "@common/atoms/Form/Field";
import Form from "@common/atoms/Form/Form";
import Icon from "@common/atoms/Icon";
import QueryErrorContainer from "@common/atoms/QueryErrorContainer";
import { columnsQuick } from "@common/atoms/TableSimple";
import TableSimple from "@common/atoms/TableSimple";
import { createAPIFetch, createAPIFetchHelper, queryString, useObservable } from "@common/rxjs/rxjs_utils";
import { isEqual } from "lodash";
import React, { useEffect, useState } from "react";
import { AiTwotoneEye } from "react-icons/ai";
import { FaFileExcel, FaFileExport, FaFilePdf, FaFilter } from "react-icons/fa";
import { useHistory, useParams, useRouteMatch } from "react-router";
import { filter, from, map, Subject, switchMap } from "rxjs";
import {
	PolicyQuery,
	setApi_PolicyDetailQuery,
	setApi_PolicyQuery,
	useApi_Carriers,
	useApi_Cities,
	useApi_Counties,
	useApi_Policy,
	useApi_PolicyDetail,
	useApi_PolicyQuery,
	useApi_States,
} from "../../rxjs/observables";

const fileExtsMap = {
	xls: ["application/vnd.ms-excel", "xlsx"],
	pdf: ["application/pdf", "pdf"],
	csv: ["text/csv", "csv"],
};
export const getAcceptHeader = (option: string): string =>
	fileExtsMap[option] ? fileExtsMap[option][0] ?? "application/pdf" : "application/pdf";

export const getFileExtension = (option: string): string =>
	fileExtsMap[option] ? fileExtsMap[option][1] ?? "pdf" : "pdf";

type DownloadQuery = PolicyQuery & { type: string };

const downloadPQuery$ = new Subject<DownloadQuery>();
const downloadP$ = downloadPQuery$.pipe(
	switchMap((params) => {
		const { type, ...queryParams } = params;
		return (
			createAPIFetchHelper<{ blob?; type? }>({
				// Define endpoint
				endpoint: `/policies${queryString(queryParams)}`,
				// Define Header
				init: { headers: { Accept: getAcceptHeader(type) } },
				// Include type in values
				okReturn: (res) => from(res.blob()).pipe(map((blob) => ({ blob, type }))),
			})
				// Don't let anything other than success through!
				.pipe(
					filter((v) => !!v?.data),
					map((v) => v.data)
				)
		);
	})
);
const setDownloadPQuery = (v) => downloadPQuery$.next(v);
downloadP$.subscribe(({ blob, type }: any) => {
	if (window.navigator.msSaveOrOpenBlob) {
		window.navigator.msSaveOrOpenBlob(
			new Blob([blob], { type: getAcceptHeader(type) }),
			`policies.${getFileExtension(type)}`
		);
	} else {
		var url = window.URL.createObjectURL(blob);
		var a = document.createElement("a");
		a.style.display = "none";
		a.href = url;
		a.download = `policies.${getFileExtension(type)}`;
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
	}
});

export const PoliciesDetail = () => {
	const { id } = useParams<{ id?: string }>();
	const policyDetail = useApi_PolicyDetail();
	useEffect(() => {
		if (id) {
			setApi_PolicyDetailQuery({ id });
			// setDetailOpen(true);
		}
	}, [id]);
	return (
		<>
			<QueryErrorContainer response={policyDetail}>
				{({ data: policyDetail }) =>
					(policyDetail && (
						<div className='padding-3'>
							We have policy id <code>{policyDetail.policyId}</code>:
							<div className='padding-3 padding-v-5'>
								<table>
									<tr>
										<th>Name</th>
										<th>Value</th>
									</tr>
									{Object.entries(policyDetail).map(([k, v]) => (
										<tr key={k}>
											<td>{String(k)}</td>
											<td>{String(v)}</td>
										</tr>
									))}
								</table>
							</div>
						</div>
					)) ||
					"This policy has no data?"
				}
			</QueryErrorContainer>
		</>
	);
};

const Policies = () => {
	// Use all static API's
	const cities = useApi_Cities();
	const counties = useApi_Counties();
	const states = useApi_States();
	const carriers = useApi_Carriers();

	// const [detailOpen, setDetailOpen] = useState(false);
	// Allow for id parameter in url and fetch when a new id is provided

	const policiesQuery = useApi_PolicyQuery();
	const policies = useApi_Policy();
	// To set a new policy query value
	const setPolicyQueryMerge = (v: Partial<PolicyQuery>) => {
		const newQuery: PolicyQuery = { pageSize: 20, ...policiesQuery, ...v };
		if (!isEqual(newQuery, policiesQuery)) setApi_PolicyQuery(newQuery);
	};
	const onFormChange = (v) => {
		setPolicyQueryMerge(v.values);
	};

	// Trigger a first fetch of policy query
	useEffect(() => setPolicyQueryMerge({}), []);

	// Set a column in table to view policy details
	const columns = columnsQuick(
		"policyNumber,Policy Number;firstName,First Name;lastName,Last Name;address,Address;zipCode,Zip;email,Email;phone,Phone;planName;numberOfMembers"
	);
	const { url } = useRouteMatch();
	const history = useHistory();
	columns.push({
		Header: "View",
		accessor: "id",
		Cell: (cell) => (
			<Button button_type='icon' ripple_type='center' onClick={() => history.push(`${url}/${cell.value}`)}>
				<Icon icon={AiTwotoneEye} />
			</Button>
		),
	});

	// Are the filters shown or not
	const [filtersOn, setFiltersOn] = useState(false);

	return (
		<>
			{/* <Drawer open={detailOpen} setOpen={setDetailOpen} right fixed drawer={}> */}

			<div style={{ display: "flex" }}>
				<div style={{ flexGrow: 1 }} />
				<Button className='outline' onClick={(e) => setFiltersOn(!filtersOn)}>
					<Icon icon={FaFilter} /> Filters
				</Button>
				<Dropdown style={{ marginLeft: "0.2em" }}>
					<Button className='outline'>
						<Icon icon={FaFileExport} /> Export
					</Button>
					<div className='background-background-10 border-radius-2'>
						<Button
							className='full-width'
							onClick={() => policiesQuery && setDownloadPQuery({ ...policiesQuery, type: "pdf" })}
						>
							<Icon icon={FaFilePdf} style={{ float: "left" }} /> PDF
						</Button>
						<Button
							className='full-width'
							onClick={() => policiesQuery && setDownloadPQuery({ ...policiesQuery, type: "xls" })}
						>
							<Icon icon={FaFileExcel} style={{ float: "left" }} /> Excel
						</Button>
					</div>
				</Dropdown>
			</div>
			{filtersOn && (
				<div>
					<Form initialState={{ values: policiesQuery || {} }} onChange={onFormChange}>
						{({ submit }) => (
							<>
								<div style={{ display: "flex", flexFlow: "row wrap", gap: "1em", alignItems: "center" }}>
									{/* POLICY NUMBER */}
									<Field name='policyNumber' label='Policy Number' />
									{/* ZIP CODE */}
									<Field name='zipCode' label='Zip Code' />
									{/* FROM DOB */}
									<Field type='date' name='fromDob' label='From Dob' />
									{/* CITY  */}
									<QueryErrorContainer response={cities} inline>
										{({ data: cities }) => (
											<Field name='cityId' type='select' placeholder='' label='Select City'>
												{cities.map((c) => (
													<option value={c.id}>{c.name}</option>
												))}
											</Field>
										)}
									</QueryErrorContainer>
									{/* COUNTY  */}
									<QueryErrorContainer response={counties} inline>
										{({ data: counties }) => (
											<Field name='countyId' type='select' placeholder='' label='Select County'>
												{Array.isArray(counties) && counties.map((c) => <option value={c.id}>{c.name}</option>)}
											</Field>
										)}
									</QueryErrorContainer>

									{/* STATES  */}
									<QueryErrorContainer response={states} inline>
										{({ data: states }) => (
											<Field name='stateId' type='select' placeholder='' label='Select State'>
												{Array.isArray(states) && states.map((c) => <option value={c.id}>{c.name}</option>)}
											</Field>
										)}
									</QueryErrorContainer>

									{/* CARRIERS  */}
									<QueryErrorContainer response={carriers} inline>
										{({ data: carriers }) => (
											<Field name='carrierId' type='select' placeholder='' label='Select Carrier'>
												{Array.isArray(carriers) && carriers.map((c) => <option value={c.id}>{c.name}</option>)}
											</Field>
										)}
									</QueryErrorContainer>
								</div>
							</>
						)}
					</Form>

					{/* These are the filters */}
				</div>
			)}

			<QueryErrorContainer response={policies}>
				{({ data: policies }) => (
					<div style={{ maxHeight: "80vh", overflow: "auto" }} className='card'>
						{(policies?.data?.length && (
							<TableSimple
								tableProps={{ style: { textAlign: "center", width: "100%" } }}
								options={{
									data: policies.data,
									columns: columns,
								}}
							/>
						)) ||
							"No data"}
					</div>
				)}
			</QueryErrorContainer>

			{/* </Drawer> */}
		</>
	);
};
export default Policies;
