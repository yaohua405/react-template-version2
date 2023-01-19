import { HashRouter as Router } from "react-router-dom";

import ThemeProvider from "@common/atoms/Theme";
import Notifications from "@common/atoms/Notifications";

function Providers(children) {
	return (
		<ThemeProvider>
			<Notifications>
				<Router>{children}</Router>
			</Notifications>
		</ThemeProvider>
	);
}
export default Providers;
