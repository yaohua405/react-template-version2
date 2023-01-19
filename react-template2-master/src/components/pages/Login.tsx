import React, { ReactNode, useEffect } from "react";
import s from "./Login.module.scss";
import { useTheme } from "@common/atoms/Theme";
import { cnf } from "@common/utils";
import Stepper from "@common/atoms/Stepper";
import Field from "@common/atoms/Form/Field";
import Form, { useForm, UseForm } from "@common/atoms/Form/Form";
import Button from "@common/atoms/Button";
import { useHistory } from "react-router";
import { Link, Route, Switch, useLocation, useParams, useRouteMatch } from "react-router-dom";
import { useQueryAction } from "@common/atoms/Hooks/useQueryAction";
import {
	setApi_ForgotPassPostQuery,
	setApi_LoginPostQuery,
	setApi_RegisterPostQuery,
	setApi_ResetPassPostQuery,
	useApi_ForgotPassPost,
	useApi_LoginPost,
	useApi_RegisterPost,
	useApi_ResetPassPost,
} from "../../rxjs/observables";
import { useNotifications } from "@common/atoms/Notifications";
import * as y from "yup";
import Icon from "@common/atoms/Icon";
import { IoIosArrowBack } from "react-icons/io";
import { QueryLoadingContainer } from "@common/atoms/QueryErrorContainer";
import { UseParams } from "@common/atoms/Hooks/routerHooks";

const loginValidation = y.object({
	email: y.string().email(),
	password: y.string().matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z\d]).{6,}$/, {
		message: "At least 1 lowercase, 1 Uppercase, and 1 special, min 6 length",
		excludeEmptyString: true,
	}),
});

export interface LoginProps {
	children?: ReactNode;
}

const fieldsCommon = {
	user: <Field name='email' type='email' label='Email' className='full-width' />,
	pass: <Field name='password' type='password' label='Password' className='full-width' />,
};
// const Reset = (props) => {

// 	return (
// 		<>
// 			<UseForm>
// 				{({ submit, state }) => (

// 				)}
// 			</UseForm>
// 		</>
// 	);
// };
// const forgot = (link) =>
const Login = ({ className, children, ...props }: LoginProps & React.HTMLAttributes<HTMLDivElement>) => {
	const theme = useTheme().name;
	className = cnf(s, `comp`, theme, className);

	const { url, path } = useRouteMatch();
	const history = useHistory();

	const not = useNotifications();
	// const onSubmit = (v) => {
	// 	// setApi_LoginPostQuery()
	// 	not.addNotification({ text: "We're sorry, this login isn't set up yet", type: "warning" });
	// };
	const onSubmitLogin = (v) => {
		setApi_LoginPostQuery(v);
	};
	const onSubmitRegister = (v) => {
		setApi_RegisterPostQuery(v);
	};
	const onSubmitForgotPass = (v) => {
		setApi_ForgotPassPostQuery(v);
	};
	const onSubmitResetPass = (v) => {
		setApi_ResetPassPostQuery(v);
	};
	const queryparams = new URLSearchParams(useLocation().search);
	const username = queryparams.get("username") ?? "";

	const login = useApi_LoginPost();
	const register = useApi_RegisterPost();
	const forgotPass = useApi_ForgotPassPost();
	const resetPass = useApi_ResetPassPost();
	useQueryAction(login, {
		onValid: ({ data: { token } }) => {
			not.addNotification({ text: "Logged in!" });
			localStorage.setItem("token", token);
			history.push("/portal/dashboard");
		},
		onError: (v) => {
			not.addNotification({ text: v.message, type: "error" });
		},
	});
	useQueryAction(register, {
		onValid: ({ data }) => {
			not.addNotification({ text: "Registered!" });
			history.push(`/login`);
		},
		onError: (v) => {
			console.log(v);
			not.addNotification({ text: v.message, type: "error" });
		},
	});
	useQueryAction(forgotPass, {
		onValid: ({ data }) => {
			not.addNotification({ text: "Reset Email Sent!" });
		},
		onError: (v) => {
			not.addNotification({ text: v.message, type: "error" });
		},
	});
	useQueryAction(resetPass, {
		onValid: ({ data }) => {
			not.addNotification({ text: "Password Reset!" });
			history.push(`/login`);
		},
		onError: (v) => {
			not.addNotification({ text: v.message, type: "error" });
		},
	});

	return (
		<div className={className} {...props}>
			<div className={cnf(s, "container")}>
				<Switch>
					{/* FORGOT */}
					<Route path={`${path}/forgot`}>
						<div style={{ position: "relative" }}>
							<Form
								useForm
								onSubmit={onSubmitForgotPass}
								initialState={{ values: { email: username, password: "" } }}
								validationSchema={loginValidation}
							>
								{({ submit, state: { values } }) => (
									<>
										<Button
											button_type='icon'
											style={{ position: "absolute", top: 0, left: 0 }}
											onClick={(e) => {
												history.goBack();
											}}
										>
											<Icon icon={IoIosArrowBack} />
										</Button>
										<h2 className='margin-top-0 padding-top-0 margin-bottom-5'>Forgot Password</h2>
										{/* <Form onSubmit={onSubmit}> */}
										{fieldsCommon.user}
										<QueryLoadingContainer response={forgotPass} className='margin-top-3'>
											{(response) => (
												<Button className='full-width border' type='submit' disabled={!!response?.loading}>
													Send Reset Email
												</Button>
											)}
										</QueryLoadingContainer>
										{/* </Form> */}
									</>
								)}
							</Form>
						</div>
					</Route>
					{/* RESET */}
					<Route path={`${path}/reset/:code`}>
						<Form
							useForm
							onSubmit={onSubmitResetPass}
							initialState={{ values: { email: username, password: "" } }}
							validationSchema={loginValidation}
						>
							{({ state: { values } }) => (
								<UseParams<{ code? }>>
									{({ code }) => {
										const code_str = String(code);
										if (values && code_str) values.code = code_str;
										return (
											<>
												<h2>Reset Password</h2>
												Code: {code_str && (code_str.length > 20 ? code_str.substr(0, 20) + "..." : code_str)}
												{Object.values(fieldsCommon)}
												<QueryLoadingContainer response={resetPass} className='margin-top-3'>
													{(response) => (
														<Button className='full-width border' type='submit' disabled={!!response?.loading}>
															Reset Password
														</Button>
													)}
												</QueryLoadingContainer>
											</>
										);
									}}
								</UseParams>
							)}
						</Form>
					</Route>

					<Route>
						<Stepper
							animTime={0.4}
							steps={[
								{
									header: "Login",
									value: (
										<Form
											useForm
											onSubmit={onSubmitLogin}
											initialState={{ values: { email: username, password: "" } }}
											validationSchema={loginValidation}
										>
											{({ submit, state: { values } }) => (
												<>
													{Object.values(fieldsCommon)}
													<QueryLoadingContainer response={login} className='margin-top-3'>
														{(response) => (
															<Button
																className='full-width primary-background'
																type='submit'
																disabled={!!response?.loading}
															>
																Login
															</Button>
														)}
													</QueryLoadingContainer>

													<Link to={`${url}/forgot`}>
														<Button className='full-width border margin-top-2'>Forgot Password</Button>
													</Link>
												</>
											)}
										</Form>
									),
								},
								{
									header: "Register",
									value: (
										<Form
											useForm
											onSubmit={onSubmitRegister}
											initialState={{ values: { email: username, password: "" } }}
											validationSchema={loginValidation}
										>
											{({ submit, state: { values } }) => (
												<>
													{Object.values(fieldsCommon)}
													<QueryLoadingContainer response={register} className='margin-top-3'>
														{(response) => (
															<Button className='full-width border ' type='submit' disabled={!!response?.loading}>
																Register
															</Button>
														)}
													</QueryLoadingContainer>
												</>
											)}
										</Form>
									),
								},
							]}
						/>
					</Route>
				</Switch>
			</div>
		</div>
	);
};

export default Login;
