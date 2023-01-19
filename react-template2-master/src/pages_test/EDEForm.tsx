import Button from "@common/atoms/Button";
import Divider from "@common/atoms/Divider";
import { Field } from "@common/atoms/Form/Field";
import Form, { FieldArray, FormNameProvider, UseForm } from "@common/atoms/Form/Form";
import moment from "moment";
import { FiX } from "react-icons/fi";
import * as y from "yup";
import Drawer, { DrawerToggle } from "@common/atoms/Drawer";
import { field_utils, regex_dict } from "@common/atoms/Form/form_utils";
import GroupClose from "@common/atoms/GroupClose";
import Icon from "@common/atoms/Icon";
import DrawerTogglePreset from "@common/molecules/DrawerTogglePreset";

y.addMethod(y.string, "assert", function (f: (v) => boolean, errorMessage) {
	return this.test(`assert`, errorMessage, function (value) {
		const { path, createError } = this;
		return f(value) || createError({ path, message: errorMessage });
	});
});

// const schema = z
// 	.object({
// 		primary: z
// 			.object({
// 				first: z
// 					.string()
// 					.min(1)
// 					.regex(/^[A-Za-z ]*$/, "Only words"),
// 				middle: z
// 					.string()
// 					.regex(/^[A-Za-z ]*$/, "Only words")
// 					.optional(),
// 				last: z
// 					.string()
// 					.min(1)
// 					.regex(/^[A-Za-z ]*$/, "Only words"),
// 				sex: z.string().optional(),
// 				dob: z.string().refine((s) => moment().diff(s, "years") >= 18, "Primary must be 18+"),
// 				tobacco: z.boolean().default(false),
// 				email: z.string().email(),
// 				phones: z
// 					.array(
// 						z
// 							.object({
// 								number: z.string().regex(regex_dict.phone, "Not a phone"),
// 								type: z.union([z.literal("cell"), z.literal("home"), z.literal("office")]).default("cell"),
// 							})
// 							.passthrough()
// 					)
// 					.nonempty(),
// 			})
// 			.passthrough(),
// 	})
// 	.passthrough();
const schemayup = y.object({
	primary: y.object({
		first: y
			.string()
			.min(1)
			.matches(/^[A-Za-z ]*$/, "Only words"),
		middle: y
			.string()
			.matches(/^[A-Za-z ]*$/, "Only words")
			.optional(),
		last: y
			.string()
			.min(1)
			.matches(/^[A-Za-z ]*$/, "Only words"),
		sex: y.string().optional(),
		dob: y.string()["assert"]((s) => moment().diff(s, "years") >= 18, "Primary must be 18+"),
		tobacco: y.boolean().default(false),
		email: y.string().email(),
		phones: y
			.array(
				y.object({
					number: y.string().matches(regex_dict.phone, "Not a phone"),
					type: y.mixed().oneOf(["cell", "home", "office"]).default("cell"),
				})
			)
			.min(1),
	}),
});

const Section = ({ content, name, ...props }) => {
	return (
		<div className='card' {...props}>
			<h3 style={{ textAlign: "center" }}>{name}</h3>
			{content}
		</div>
	);
};
const sections = {
	primary_contact: {
		name: "Primary Contact",
		content: (
			<>
				<GroupClose style={{ alignItems: "start", flexFlow: "row wrap" }}>
					<Field name='primary.first' label='First Name' required />
					<Field name='primary.middle' label='Middle Name' />
					<Field name='primary.last' label='Last Name' required style={{ flexGrow: 2 }} />
				</GroupClose>

				<GroupClose style={{ alignItems: "center", gap: ".5em", flexFlow: "row wrap" }}>
					{/* <Apply to={Field} rootProps={{ style: { flex: "1 1 auto" } }}> */}
					<Field name='primary.sex' type='select' label='Sex'>
						<option value='male'>Male</option>
						<option value='female'>Female</option>
					</Field>
					<Field name='primary.dob' type='date' label='Date of Birth' required />
					<Field name='primary.tobacco' type='checkbox' label='Tobacco User' required />
					<Field name='primary.email' label='Email' type='email' required />
					{/* </Apply> */}
				</GroupClose>

				<Divider />
				<h4>Phones</h4>

				<FieldArray name='primary.phones'>
					{({ arr, push, Map, remove }) => (
						<div>
							<div style={{ flexFlow: "row wrap", display: "flex", gap: 10 }}>
								{Map({
									className: "border padding-3 border-radius-2",
									style: { flex: "1 1 auto", position: "relative" },
									children: (phone, i) => (
										<>
											<div style={{ fontSize: "1em", fontWeight: "bold" }} className='margin-bottom-3'>
												Phone {i}
											</div>
											<Field name='number' label='Number' required {...field_utils.phone} />
											<Field name='type' type='select' label='Type' required>
												<option value='home'>Home</option>
												<option value='cell'>Cell</option>
												<option value='office'>Office</option>
											</Field>
											<Button
												button_type='icon'
												style={{ position: "absolute", top: 0, right: 0, padding: ".5em" }}
												onClick={() => remove(i)}
											>
												<Icon icon={FiX} />
											</Button>
										</>
									),
								})}
							</div>
							<div style={{ textAlign: "right" }} className='margin-v-2 margin-bottom-3'>
								<Button onClick={() => push(undefined)}>Add Phone</Button>
							</div>
						</div>
					)}
				</FieldArray>
				<Divider />
				<h4>How would you like to get notices?</h4>
				<div className='col'>
					<div className='col-12 col-6-tablet'>
						<Field name='primary.notice.type' type='radio' value='paperless' label='Paperless' />
						<UseForm>
							{({ getValue }) =>
								getValue("primary.notice.type") === "paperless" && (
									<div>
										<Field type='checkbox' name='primary.notice.text' label='Text Me' />
										<Field type='checkbox' name='primary.notice.email' label='Email Me' />
									</div>
								)
							}
						</UseForm>
					</div>
					<div className='col-12 col-6-tablet'>
						<Field name='primary.notice.type' type='radio' value='mail' label='Via mail' />
					</div>
				</div>
				<Divider />
				<Field name='primary.language' type='select' label='Preferred Language' style={{ width: "10em" }}>
					<option value='english'>English</option>
					<option value='spanish'>Spanish</option>
				</Field>
				<Divider />
				<h4>Home Address</h4>
				<FormNameProvider name='primary.address'>
					<UseForm>
						{({ getValue }) => (
							<>
								<Field name='line1' label='Address' />
								<Field name='line2' label='Apartment, suite, etc.' />
								<Field name='county' label='County' />
								<Field name='zip' label='Zip' />
								<Field name='city' label='City' />
								<Field name='state' label='State' />
								{getValue("primary.notice.type") === "mail" && (
									<Field name='primary.address_is_mail' type='checkbox' label='Mailing address same as home?' />
								)}
							</>
						)}
					</UseForm>
				</FormNameProvider>
				<FormNameProvider name='primary.address_mail'>
					<UseForm>
						{({ getValue }) =>
							!(getValue("primary.address_is_mail") ?? true) && (
								<>
									<Field name='line1' label='Address' />
									<Field name='line2' label='Apartment, suite, etc.' />
									<Field name='county' label='County' />
									<Field name='zip' label='Zip' />
									<Field name='city' label='City' />
									<Field name='state' label='State' />
								</>
							)
						}
					</UseForm>
				</FormNameProvider>
				<Field name='primary.professional_help' type='checkbox' label='Is a professional helping you?' />
			</>
		),
	},
	household: {
		name: "Household",
		content: (
			<>
				<GroupClose style={{ alignItems: "start", flexFlow: "row wrap" }}>
					<Field name='primary.first' label='First Name' required />
					<Field name='primary.middle' label='Middle Name' />
					<Field name='primary.last' label='Last Name' required style={{ flexGrow: 2 }} />
				</GroupClose>

				<GroupClose style={{ alignItems: "center", gap: ".5em", flexFlow: "row wrap" }}>
					{/* <Apply to={Field} rootProps={{ style: { flex: "1 1 auto" } }}> */}
					<Field name='primary.sex' type='select' label='Sex'>
						<option value='male'>Male</option>
						<option value='female'>Female</option>
					</Field>
					<Field name='primary.dob' type='date' label='Date of Birth' required />
					<Field name='primary.tobacco' type='checkbox' label='Tobacco User' required />
					<Field name='primary.email' label='Email' type='email' required />
					{/* </Apply> */}
				</GroupClose>

				<Divider />
				<h4>Phones</h4>
			</>
		),
	},
};

const EDEForm = () => {
	return (
		<Form validationSchema={schemayup}>
			<Drawer
				right
				fixed
				drawer={
					<UseForm>
						{({ state }) => (
							<textarea
								readOnly
								value={JSON.stringify(state, null, 2)}
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
							onClick={() => document?.getElementById(k)?.scrollIntoView({ block: "start", behavior: "smooth" })}
						>
							{/* {k
										.replace(/_/g, " ")
										.split(" ")
										.map((s) => s[0].toUpperCase() + s.substr(1))
										.join(" ")} */}
							{v.name}
						</Button>
					))}
					contentProps={{ style: { textAlign: "center" } }}
				>
					<div
						style={{
							display: "inline-flex",
							justifyContent: "center",
							flexFlow: "column nowrap",
							gap: 50,
							maxWidth: 700,
						}}
						className='padding-4 padding-bottom-8'
					>
						{Object.entries(sections).map(([k, v], i) => Section({ ...v, id: k, key: i }))}
					</div>

					<DrawerTogglePreset style={{ position: "fixed", bottom: 12, left: 12 }} className='primary-background' />
				</Drawer>
				<DrawerToggle>
					<Button style={{ position: "fixed", bottom: 12, right: 12 }} className='primary-background'>
						FormState
					</Button>
				</DrawerToggle>
			</Drawer>
		</Form>
	);
};

export default EDEForm;
