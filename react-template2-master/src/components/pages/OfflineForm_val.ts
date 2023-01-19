import { regex_dict } from "@common/atoms/Form/form_utils";
import { objectEntries } from "@common/utils";
import moment from "moment";
import * as y from "yup";

y.addMethod(y.string, "assert", function (f: (v) => boolean, errorMessage) {
	return this.test(`assert`, errorMessage, function (value) {
		const { path, createError } = this;
		return f(value) || createError({ path, message: errorMessage });
	});
});
const migratory_status = y.mixed().oneOf(["resident", "citizen"]).required();

const schema_common = {
	name: y.string().required().matches(regex_dict.name, { message: "Not valid", excludeEmptyString: true }),
	name_optional: y
		.string()
		.nullable()
		.optional()
		.matches(regex_dict.name, { message: "Not valid", excludeEmptyString: true }),
};
const schema_basic = {
	name: schema_common.name.max(120),
	dob: y
		.string()
		.required()
		["assert"]((s) => moment().diff(s, "years") >= 18, "Must be 18+"),
	apply: y.boolean().default(true),
	sex: y.mixed().oneOf(["M", "F"]).required(),
	ssn: y.string().optional().nullable().matches(regex_dict.ssn, { message: "Not an SSN", excludeEmptyString: true }),
	migratoryStatus: migratory_status,
};
const schema_income = {
	typeOfIncome: y.mixed().oneOf(["employed", "self_employed"]).required(),
	annualIncome: y.number().min(100).required(),
	// employer: y.object({
	employerName: y.string().max(50).required(),
	// .matches(regex_dict.name, "Only words")
	employerPhone: y.string().matches(regex_dict.phone, { message: "Not a Phone", excludeEmptyString: true }).required(),
	// }).optional(),
};
const memberBasic = {
	...schema_basic,
	dob: y.string().required(),
	relation: y.mixed().oneOf(["spouse", "dependent"]).required(),
};
const schema = y.object({
	// offapp: y.object({
	// primary: y.object({
	...schema_basic,
	phone: y.string().required().matches(regex_dict.phone, "Not a phone"),
	// tobacco: y.boolean().default(false),
	email: y.string().required().email().max(62),
	// address: y.object({
	address: y.string().required().max(95),
	// zip: y.string().required(),
	city: y.string().required().max(35),
	state: y.string().required().max(2),
	// }),
	residenceCardNumber: y.string().optional().nullable().max(13),
	// }),
	// income: y.object({
	...schema_income,
	// }),
	// household: y.object({
	totalMembers: y.number().required().min(1).max(20),
	applyingForCoverage: y.boolean().required().default(true),
	// income_type: y.string().required(),
	annualHouseholdIncome: y.number().required().min(0),
	offlineAppMembers: y.array(
		y.object({
			...memberBasic,
			// income: y
			// 	.object({
			...Object.entries(schema_income).reduce((a, [k, v]) => {
				a[k] = y
					.string()
					.nullable()
					.when("relation", (r, s) => (r === "spouse" ? v : s));
				return a;
			}, {} as any),
			// })
			// .optional(),
		})
	),
	// }),
	// plan: y.object({
	planSelected: y.string().required(),
	monthlyPayment: y.number().required().min(0),
	// }),
	// payment_card: y.object({
	cardNumber: y.string().required().matches(regex_dict.card_number, "Not a card number"),
	cardExpDate: y.string().required().matches(regex_dict.card_expiration, "Not an expiration"),
	cardCvv: y.string().required().matches(regex_dict.card_cvv, "Not a CVV"),

	cardFirstName: schema_common.name.max(50),
	cardMiddleName: schema_common.name_optional.max(50),
	cardLastName: schema_common.name.max(50),
	// }),
	// }),
});

export type OfflineAppFormType = y.Asserts<typeof schema>;

// Add a prefix to keys
// ...objectEntries(schema_name).reduce((a,[k,v]) => {a[`c_${k}`];return a;}, {} as {[k:string]:y.BaseSchema}),
export const stateLabelValues = [
	{ label: "Alabama", value: "AL" },
	{ label: "Alaska", value: "AK" },
	{ label: "American Samoa", value: "AS" },
	{ label: "Arizona", value: "AZ" },
	{ label: "Arkansas", value: "AR" },
	{ label: "California", value: "CA" },
	{ label: "Colorado", value: "CO" },
	{ label: "Connecticut", value: "CT" },
	{ label: "Delaware", value: "DE" },
	{ label: "District of Columbia", value: "DC" },
	{ label: "Florida", value: "FL" },
	{ label: "Georgia", value: "GA" },
	{ label: "Guam", value: "GU" },
	{ label: "Hawaii", value: "HI" },
	{ label: "Idaho", value: "ID" },
	{ label: "Illinois", value: "IL" },
	{ label: "Indiana", value: "IN" },
	{ label: "Iowa", value: "IA" },
	{ label: "Kansas", value: "KS" },
	{ label: "Kentucky", value: "KY" },
	{ label: "Louisiana", value: "LA" },
	{ label: "Maine", value: "ME" },
	{ label: "Maryland", value: "MD" },
	{ label: "Massachusetts", value: "MA" },
	{ label: "Michigan", value: "MI" },
	{ label: "Minnesota", value: "MN" },
	{ label: "Mississippi", value: "MS" },
	{ label: "Missouri", value: "MO" },
	{ label: "Montana", value: "MT" },
	{ label: "Nebraska", value: "NE" },
	{ label: "Nevada", value: "NV" },
	{ label: "New Hampshire", value: "NH" },
	{ label: "New Jersey", value: "NJ" },
	{ label: "New Mexico", value: "NM" },
	{ label: "New York", value: "NY" },
	{ label: "North Carolina", value: "NC" },
	{ label: "North Dakota", value: "ND" },
	{ label: "Ohio", value: "OH" },
	{ label: "Oklahoma", value: "OK" },
	{ label: "Oregon", value: "OR" },
	{ label: "Pennsylvania", value: "PA" },
	{ label: "Puerto Rico", value: "PR" },
	{ label: "Rhode Island", value: "RI" },
	{ label: "South Carolina", value: "SC" },
	{ label: "South Dakota", value: "SD" },
	{ label: "Tennessee", value: "TN" },
	{ label: "Texas", value: "TX" },
	{ label: "Utah", value: "UT" },
	{ label: "Vermont", value: "VT" },
	{ label: "Virgin Islands", value: "VI" },
	{ label: "Virginia", value: "VA" },
	{ label: "Washington", value: "WA" },
	{ label: "West Virginia", value: "WV" },
	{ label: "Wisconsin", value: "WI" },
	{ label: "Wyoming", value: "WY" },
];

export default schema;
