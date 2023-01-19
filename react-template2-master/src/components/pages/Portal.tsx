import Button from "@common/atoms/Button";
import Collapsible, { CollapsibleToggleIcon } from "@common/atoms/Collapsible";
import Drawer, { DrawerContentData } from "@common/atoms/Drawer";
import Select from "@common/atoms/Form/Select";
import Apply from "@common/atoms/HOC/Apply";
import Icon from "@common/atoms/Icon";
import QueryErrorContainer from "@common/atoms/QueryErrorContainer";
import { useTheme } from "@common/atoms/Theme";
import DrawerTogglePreset from "@common/molecules/DrawerTogglePreset";
import Toolbar from "@common/organisms/Toolbar";
import { cnf } from "@common/utils";
import { isLogin } from "@common/utils_react";
import React, { ReactNode, useState } from "react";
import { AiOutlineBell, AiOutlinePieChart, AiOutlineUser } from "react-icons/ai";
import { BiNews } from "react-icons/bi";
import { Link, Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
// import user_icon from "../../glasses_man_small.jpg";
import { setApi_SummaryQuery, useApi_Contacts, useApi_User, useApi_UserPhoto } from "../../rxjs/observables";
import Dashboard from "../molecules/Dashboard";
import Policies, { PoliciesDetail } from "../molecules/Policies";
import Login from "./Login";
import MyAccount from "./MyAccount";
import MyCalendar from "./MyCalendar";
import OfflineApp from "./OfflineForm";
import OfflineManage from "./OfflineManage";
import s from "./Portal.module.scss";
import user_icon from "../../profile.svg";

export const usePaths = (paths: string[] | string) => {
	const match = useRouteMatch();
	// Defining links
	const linkButton = (children) => <Button>{children}</Button>;
	const pathArr = Array.isArray(paths) ? paths : paths.split(";").map((v) => v.trim());
	// Creating common pathNames, links and linkNames
	const others = pathArr.reduce(
		(a, v) => {
			const linkName = `${match.url}/${v}`;
			const pathName = `${match.path}/${v}`;
			a.links[v] = (children) => <Link to={linkName}>{linkButton(children)}</Link>;
			a.pathNames[v] = pathName;
			a.linkNames[v] = linkName;

			return a;
		},
		{ links: {}, pathNames: {}, linkNames: {} } as {
			links: { [key: string]: (c) => any };
			pathNames: any;
			linkNames: any;
		}
	);
	return { ...match, ...others };
};

export interface DashboardProps {
	children?: ReactNode | undefined;
}
const ToHide = (props) => <>{props.hide ? "" : props.children}</>;
const Portal = ({ className, children, ...props }: DashboardProps & React.HTMLAttributes<HTMLDivElement>) => {
	const theme = useTheme().name;
	className = cnf(s, `comp`, theme, className);

	const linkButton = (children) => <Button>{children}</Button>;
	const pathArr = [
		"dashboard",
		"account",
		"policies",
		"stats",
		"commisions",
		"calendar",
		"analyst",
		"messages",
		"email",
		"today",
		"offline_form",
		"offline_manage",
		"offline_queue",
		"login",
	];
	const { links, linkNames, path, pathNames } = usePaths(pathArr);
	// Defining drawer links content

	const dcontent: DrawerContentData = {
		dashboard: {
			header: links.dashboard(
				<>
					<Icon icon={BiNews} />
					<ToHide>Dashboard</ToHide>
				</>
			),
		},
		profile: {
			header: linkButton(
				<>
					<Icon icon={AiOutlineUser} />
					<ToHide>
						My Profile
						<div style={{ flexGrow: 1 }} />
						<CollapsibleToggleIcon />
					</ToHide>
				</>
			),
			content: (
				<>
					{links.account("My Account")}
					{links.policies("My Policies")}
					{links.stats("My Stats")}
					{links.commisions("My Commisions")}
					{links.calendar("My Calendar")}
					{links.offline_form("Offline App Form")}
					{links.offline_manage("Offline App Manage")}
					{links.offline_queue("Offline App Queue")}
				</>
			),
		},
		analyst: {
			header: links.analyst(
				<>
					<Icon icon={AiOutlinePieChart} />
					<ToHide>Analyst</ToHide>
				</>
			),
		},
		notifications: {
			header: linkButton(
				<>
					<Icon icon={AiOutlineBell} />
					<ToHide>
						Notifications
						<div style={{ flexGrow: 1 }} />
						<CollapsibleToggleIcon />
					</ToHide>
				</>
			),
			content: (
				<>
					{links.messages("Messages")}
					{links.email("Email")}
					{links.today("Today")}
				</>
			),
		},
	};
	const [open, setOpen] = useState(true);
	const sideLinks = (
		<>
			{/* <Apply depth_max={-1} className={`${open ? "" : "hide"}`} to={CollapsibleToggleIcon}> */}
			<Apply depth_max={-1} hide={!open} to={ToHide}>
				<Apply
					depth_max={-1}
					style={{ flexShrink: 0 }}
					className={`${open ? "margin-right-2" : ""}`}
					size='1.4em'
					to={Icon}
				>
					<Apply
						depth_max={-1}
						className='full-width border-radius-0'
						style={{ justifyContent: open ? "left" : "center", display: "flex", alignItems: "center" }}
						to={Button}
					>
						{Object.entries(dcontent).map(
							([k, v], i) =>
								v && (
									<Collapsible key={i} placeholder='Select Agent' canCollapse={open}>
										<div className={cnf(s, "margin-top-3")}>{v.header}</div>
										<div style={{ paddingLeft: 35 }}>{v.content}</div>
									</Collapsible>
								)
						)}
					</Apply>
				</Apply>
			</Apply>
			{/* </Apply> */}
		</>
	);
	const routes = (
		<Switch>
			<Route exact path={`${path}/`}>
				<Redirect to={linkNames.dashboard} />
			</Route>
			<Route path={pathNames.dashboard} component={Dashboard} />
			<Route path={pathNames.offline_manage} component={OfflineManage} />
			<Route path={`${pathNames.policies}/:id`} component={PoliciesDetail} />
			<Route path={pathNames.policies} component={Policies} />
			<Route path={pathNames.account} component={MyAccount} />
			<Route path={pathNames.calendar} component={MyCalendar} />
			<Route path={pathNames.offline_form} component={OfflineApp} />
			<Route>Not Implemented</Route>
		</Switch>
	);

	const contacts = useApi_Contacts();
	const user = useApi_User();
	const userPhoto = useApi_UserPhoto();

	return (
		<>
			<Switch>
				<Route path={pathNames.login} component={Login} />
				<Route>
					<Drawer
						// background={false}
						// floating
						fixed
						visible_always
						// sticky
						// style={{ minHeight: "100%" }}
						open={open}
						setOpen={setOpen}
						style={{ minHeight: "100vh" }}
						drawer={
							<>
								{/* <DrawerTogglePreset /> */}
								<div className='padding-v-3'>
									<div style={{ display: "flex", justifyContent: "center" }} className='margin-3'>
										{/* <QueryErrorContainer response={userPhoto}>
											{({ data: userPhoto }) => ( */}
										<div
											style={{
												borderRadius: "50%",
												// width: '100%', paddingTop:'100%',
												flex: "1 1 50px",
												maxWidth: 60,
												overflow: "hidden",
											}}
										>
											{userPhoto?.data ? (
												<img src={`data:image/png;base64,${userPhoto?.data}`} alt='Profile' />
											) : (
												<img src={user_icon} alt='Profile Default' />
											)}
										</div>
										{/* )}
										</QueryErrorContainer> */}
									</div>
									{/* <Icon size={70} style={{ width: "100%" }} className='margin-bottom-1' icon={FaUserCircle}></Icon> */}
									{/* Contact Selection */}
									<div className={open ? "" : "hide"}>
										{/* <QueryErrorContainer response={contacts}>
											{({ data: contacts }) => (
												<Select
													onChange={(e) => e.target["value"] && setApi_SummaryQuery({ contactId: e.target["value"] })}
													placeholder='Select Agent'
												>
													{Array.isArray(contacts) &&
														contacts.map((c) => (
															<option value={c.id} key={c.id}>
																{c.firstName}
															</option>
														))}
												</Select>
											)}
										</QueryErrorContainer> */}
										<QueryErrorContainer response={user}>
											{({ data: user }) => <div>{user.name}</div>}
										</QueryErrorContainer>
									</div>
								</div>
								{sideLinks}
							</>
						}
						// contentProps={{ style: { marginLeft: "250px" } }}
						drawerProps={{
							// className:cnf(s, 'drawer'),

							style: { background: "linear-gradient(75deg, #7B54A3, #DF5395)", height: "100vh" },
						}}
					>
						<Toolbar
							left={<DrawerTogglePreset />}
							middle={
								<>
									<div style={{ fontSize: "1.4em" }}>
										<span>Agent Portal</span>
										<br />
										{/* <span>{path}</span> */}
									</div>
								</>
							}
							right={
								<>
									{isLogin() ? (
										<Link to='/login'>
											<Button onClick={() => localStorage.removeItem("token")}>Logout</Button>
										</Link>
									) : (
										<Link to='/login'>
											<Button>Login</Button>
										</Link>
									)}
								</>
							}
						/>
						<div className='padding-4'>{routes}</div>
					</Drawer>
				</Route>
			</Switch>
		</>
	);
};

export default Portal;
