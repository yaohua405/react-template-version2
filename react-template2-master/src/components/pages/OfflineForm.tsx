import Button from "@common/atoms/Button";
import Drawer, { DrawerToggle } from "@common/atoms/Drawer";
import Form, { FieldArray, FormNameProvider, UseForm } from "@common/atoms/Form/Form";
import Icon from "@common/atoms/Icon";
import { useNotifications } from "@common/atoms/Notifications";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { setApi_OfflineAppPostQuery, useApi_OfflineAppPost } from "../../rxjs/observables";
import { scrollToElement } from "@common/utils_react";
import Divider from "@common/atoms/Divider";
import { Field } from "@common/atoms/Form/Field";
import { field_utils } from "@common/atoms/Form/form_utils";
import DrawerTogglePreset from "@common/molecules/DrawerTogglePreset";
import schema, { stateLabelValues } from "./OfflineForm_val";
export { schema as OfflineForm_Schema };

const Section = ({ content, name, ...props }) => {
	return (
		<div className='card' style={{ display: "flex", flexFlow: "row wrap", gap: ".5em" }} {...props}>
			<h3 style={{ textAlign: "center", width: "100%" }}>{name}</h3>
			{content}
		</div>
	);
};
const subsections = {
	income: (
		<FormNameProvider name=''>
			<Field name='typeOfIncome' label='Type of income' type='select' placeholder='' required>
				<option value='employed'>Employed</option>
				<option value='self_employed'>Self-employed</option>
			</Field>
			<Field name='annualIncome' label='Annual Income' {...field_utils.money} required />
			{/* <UseForm>
				{({ getValueRel }) =>
					getValueRel("income_type") === "employed" && ( */}
			<>
				<Field name='employerName' label='Employer Name' required />
				<Field name='employerPhone' label='Employer Phone Number' {...field_utils.phone} required />
			</>
			{/* )
				}
			</UseForm> */}
		</FormNameProvider>
	),
	basic: (
		<FormNameProvider name=''>
			<Field name='name' label='Name' required />
			<Field name='dob' label='Date of Birth' type='date' required />
			<Field name='apply' label='Apply' type='checkbox' required />
			<Field name='sex' type='select' label='Sex' placeholder='' required>
				<option value='M'>Male</option>
				<option value='F'>Female</option>
			</Field>
			<Field name='ssn' label='SSN' {...field_utils.ssn} />
			<Field name='migratoryStatus' label='Migratory Status' type='select' placeholder='' required>
				<option value='resident'>Resident</option>
				<option value='citizen'>Citizen</option>
			</Field>
		</FormNameProvider>
	),
};
const sections = {
	primary: {
		name: "Primary",
		content: (
			<>
				<FormNameProvider name=''>
					{subsections.basic}
					<Field name='phone' label='Cell Phone' {...field_utils.phone} required />
					<Field name='email' label='Email' required />
					<FormNameProvider name=''>
						<Field name='address' label='Address' required />
						{/* <Field name='zip' label='Zip' required /> */}
						<Field name='city' label='City' required />
						<Field name='state' type='select' label='State' placeholder='' required>
							{stateLabelValues.map((s) => (
								<option value={s.value} key={s.value}>
									{s.label}
								</option>
							))}
						</Field>
					</FormNameProvider>

					<Field name='residenceCardNumber' label='Residence Card #' />
				</FormNameProvider>
			</>
		),
	},
	income: {
		name: "Income",
		content: <>{subsections.income}</>,
	},
	household: {
		name: "Household",
		content: (
			<>
				<FormNameProvider name=''>
					<Field name='totalMembers' label='Family size' {...field_utils.number} required />
					<Field name='applyingForCoverage' label='Family applying for coverage?' type='checkbox' required />
					<Field name='annualHouseholdIncome' label='Household Income' {...field_utils.money} required />

					<FieldArray name='offlineAppMembers'>
						{({ arr, push, remove, Map }) => (
							<>
								<Divider style={{ width: "100%" }} />
								{!arr?.length && <div className='border padding-3 text-align-center full-width'>No members</div>}
								{Map({
									className: "border padding-3",
									style: { display: "flex", flexFlow: "row wrap" },
									children: ({ value, index }) => (
										<>
											<div style={{ display: "flex", flexFlow: "row nowrap", width: "100%", gap: 10 }}>
												<h4 style={{ flexGrow: 1, textAlign: "left" }}>
													Member {index} - {value?.["name"] || ""}
												</h4>
												<Button button_type='icon' onClick={() => remove(index)}>
													<Icon icon={FiX} />
												</Button>
											</div>

											<Field name='relation' label='Relation' type='select' placeholder='' required>
												<option value='spouse'>Spouse</option>
												<option value='dependent'>Dependent</option>
											</Field>

											{/* BASIC */}
											{subsections.basic}

											<UseForm>
												{({ getValueRel }) => getValueRel("relation") === "spouse" && subsections.income}
											</UseForm>
										</>
									),
								})}
								<div style={{ display: "flex", flexFlow: "row nowrap", width: "100%", gap: 20, alignItems: "center" }}>
									<Divider style={{ flex: "1 1 auto" }} />
									<Button style={{ justifySelf: "end" }} onClick={() => push()}>
										Add Member
									</Button>
								</div>
							</>
						)}
					</FieldArray>
				</FormNameProvider>
			</>
		),
	},
	plan: {
		name: "Plan",
		content: (
			<>
				<Field name='planSelected' label='Plan Selected' required />
				<Field name='monthlyPayment' label='Monthly Payment' required {...field_utils.money} />
			</>
		),
	},
	payment_card: {
		name: "Payment Card",
		content: (
			<>
				<FormNameProvider name=''>
					<Field name='cardNumber' label='Card Number' required {...field_utils.card_number} />
					<Field
						name='cardExpDate'
						label={
							<>
								Card Expiration <b>mm/yy</b>
							</>
						}
						required
						{...field_utils.card_expiration}
					/>
					<Field name='cardCvv' label='CVV' required {...field_utils.card_cvv} />
					{/* <GroupClose> */}
					<Field name='cardFirstName' label='Card First Name' required />
					<Field name='cardMiddleName' label='Card Middle Name' />
					<Field name='cardLastName' label='Card Last Name' required />
					{/* </GroupClose> */}
				</FormNameProvider>
			</>
		),
	},
};

export const OfflineAppForm = ({ children }: { children? }) => (
	<>
		<div style={{ textAlign: "center" }}>
			<div
				style={{
					display: "inline-flex",
					// justifyContent: "center",
					flexFlow: "column nowrap",
					gap: 50,
					maxWidth: 700,
				}}
				className='padding-4'
			>
				{/* <FormNameProvider name='offapp'> */}
				{Object.entries(sections).map(([k, v], i) => Section({ ...v, id: k, key: i }))}
				{/* </FormNameProvider> */}
				{children}
			</div>
		</div>
	</>
);

const OfflineApp = (props) => {
	const nots = useNotifications();
	const offlineFormPost = useApi_OfflineAppPost();

	useEffect(() => {
		if (offlineFormPost) {
			if (!offlineFormPost.errors) {
				nots.addNotification({ text: "Form successfully submitted!" });
			} else if (offlineFormPost.errors) {
				nots.addNotification({ type: "error", text: `Form submission error: ${offlineFormPost.message}` });
			}
		}
	}, [offlineFormPost]);

	const onSubmit = (vals) => {
		if (vals) {
			console.log("Submitting ", vals);
			nots.addNotification({ text: "Validation passed, submitting!" });
			setApi_OfflineAppPostQuery(vals);
		} else {
			nots.addNotification({ type: "error", text: "Validation failed, form errors!" });
		}
	};
	return (
		<div style={{ position: "relative" }}>
			<Form validationSchema={schema} onSubmit={onSubmit}>
				<Drawer
					right
					fixed
					drawer={
						<UseForm>
							{({ state }) => (
								<textarea
									readOnly
									value={JSON.stringify(state, null, 4)}
									style={{
										height: "100%",
										width: "100%",
									}}
									className='background-background-active'
								></textarea>
							)}
						</UseForm>
					}
					maxWidth={400}
				>
					<Drawer
						fixed
						floating
						drawer={Object.entries(sections).map(([k, v]) => (
							<Button
								key={k}
								className='full-width border-radius-0'
								onClick={() => {
									scrollToElement(document?.getElementById(k), { offset: -80 });
								}}
							>
								{v.name}
							</Button>
						))}
						contentProps={{ style: { textAlign: "center" } }}
					>
						<DrawerTogglePreset
							style={{
								position: "fixed",
								display: "inline-block",
								top: "50%",
								transform: "translateY(-50%)",
								left: 12,
							}}
							className='primary-background'
						/>

						<OfflineAppForm>
							<UseForm>
								{({ submit }) => (
									<Button className='full-width primary-background-5' onClick={() => submit()}>
										Submit
									</Button>
								)}
							</UseForm>
						</OfflineAppForm>
					</Drawer>

					<DrawerToggle>
						<Button
							style={{ position: "fixed", bottom: 12, right: 12, display: "inline-block" }}
							className='primary-background'
						>
							FormState
						</Button>
					</DrawerToggle>
				</Drawer>
			</Form>
		</div>
	);
};
export default OfflineApp;
