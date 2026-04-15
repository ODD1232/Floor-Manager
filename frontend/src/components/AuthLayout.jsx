import { Outlet } from 'react-router-dom';

// AuthLayout is now a transparent pass-through.
// Each auth page (Login, Register) owns its own full-page layout and styling.
const AuthLayout = () => <Outlet />;

export default AuthLayout;