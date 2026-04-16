import CreateUser from "../views/CreateUser";
import RolesPermissions from "../views/RolesPermissions";
import NewCandidateForm from "../views/recruitment/NewCandidateForm";
import Round2Test from "../views/recruitment/Round2Test";
import Round2Interview from "../views/recruitment/Round2Interview";
import Round3Department from "../views/recruitment/Round3Department";
import FinalApproval from "../views/recruitment/FinalApproval";

export const dashboardRoutes = [
  {
    id: "administration",
    label: "Administration",
    children: [
      {
        id: "create-user",
        label: "Create User",
        path: "create-user",
        to: "/dashboard/create-user",
        permission: "users.create",
        element: CreateUser,
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        path: "roles-permissions",
        to: "/dashboard/roles-permissions",
        permission: "roles.view",
        element: RolesPermissions,
      },
    ],
  },
  {
    id: "recruitment",
    label: "Recruitment",
    children: [
      {
        id: "new-candidate",
        label: "New Candidate",
        path: "recruitment/new-candidate",
        to: "/dashboard/recruitment/new-candidate",
        permission: "recruitment.round1.create",
        element: NewCandidateForm,
      },
      {
        id: "round2-test",
        label: "Round 2 Test",
        path: "recruitment/round2-test",
        to: "/dashboard/recruitment/round2-test",
        permission: "recruitment.round2_test.view",
        element: Round2Test,
      },
      {
        id: "round2-interview",
        label: "Round 2 Interview",
        path: "recruitment/round2-interview",
        to: "/dashboard/recruitment/round2-interview",
        permission: "recruitment.round2_int.view",
        element: Round2Interview,
      },
      {
        id: "round3",
        label: "Round 3 Department",
        path: "recruitment/round3",
        to: "/dashboard/recruitment/round3",
        permission: "recruitment.round3.view",
        element: Round3Department,
      },
      {
        id: "final-approval",
        label: "Final Approval",
        path: "recruitment/final-approval",
        to: "/dashboard/recruitment/final-approval",
        permission: "recruitment.round3.view",
        element: FinalApproval,
      },
    ],
  },
];