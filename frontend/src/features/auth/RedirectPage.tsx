import type { User } from "../../App";
import Main from "../app/Main";
import AccessPendingPage from "./AccessPendingPage";
import AccessRevokedPage from "./AccessRevokedPage";

type RedirectPageProps = {
    user: User,
    handleLogout: () => void
}

const RedirectPage = ({ user, handleLogout }: RedirectPageProps) => {
    return (
        <>
            {user.status == 0 && <AccessPendingPage handleLogout = {handleLogout} />}
            {user.status == 1 && <Main  user={user} handleLogout={handleLogout} />}
            {user.status == 2 && <AccessRevokedPage handleLogout = {handleLogout} />}
        </>
    )
}

export default RedirectPage;