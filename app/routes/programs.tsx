import { Outlet } from "react-router";

export function meta() {
  return [{ title: "Programs · Dossier" }];
}

export default function ProgramsLayout() {
  return <Outlet />;
}
