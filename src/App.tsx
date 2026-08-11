import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Doctors from "./pages/Doctors";
import Booking from "./pages/Booking";
import BookingConfirmed from "./pages/BookingConfirmed";
import PatientDashboard from "./pages/PatientDashboard";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Soins from "./pages/Soins";
import Expertise from "./pages/Expertise";
import Equipe from "./pages/Equipe";
import Faq from "./pages/Faq";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminMessages from "./pages/admin/AdminMessages";
import Contact from "./pages/Contact";
import { AuthProvider } from "./hooks/useAuth";
import { AppSettingsProvider } from "./hooks/useAppSettings";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminAppointmentNew from "./pages/admin/AdminAppointmentNew";
import AdminAppointmentCalendar from "./pages/admin/AdminAppointmentCalendar";
import AdminAppointmentKanban from "./pages/admin/AdminAppointmentKanban";
import AdminAppointmentRequests from "./pages/admin/AdminAppointmentRequests";
import AdminPatients from "./pages/admin/AdminPatients";
import { AdminSpecialties, AdminClinics } from "./pages/admin/AdminCatalog";
import AdminClinicAudit from "./pages/admin/AdminClinicAudit";
import AdminAssistantVerifier from "./pages/admin/AdminAssistantVerifier";
import AdminPatientDetails from "./pages/admin/AdminPatientDetails";
import AdminPatientCreate from "./pages/admin/AdminPatientCreate";
import AdminDoctorDetails from "./pages/admin/AdminDoctorDetails";
import AdminDoctorAdd from "./pages/admin/AdminDoctorAdd";
import AdminDoctorSchedule from "./pages/admin/AdminDoctorSchedule";
import {
  AdminDeleteRequests, AdminReports,
  AdminLocation, AdminTestimonials,
} from "./pages/admin/AdminStubs";
import AdminFaq from "./pages/admin/AdminFaq";
import AdminPages from "./pages/admin/AdminPages";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminMediaLibrary from "./pages/admin/AdminMediaLibrary";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminApprovals from "./pages/admin/AdminApprovals";
import PendingApproval from "./pages/PendingApproval";
import { PermissionRoute } from "./components/permissions";
import BillingDashboard from "./pages/admin/billing/BillingDashboard";
import Invoices from "./pages/admin/billing/Invoices";
import InvoiceDetails from "./pages/admin/billing/InvoiceDetails";
import CreateInvoice from "./pages/admin/billing/CreateInvoice";
import Payments from "./pages/admin/billing/Payments";
import Services from "./pages/admin/billing/Services";
import Categories from "./pages/admin/billing/Categories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppSettingsProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/confirmed/:id" element={<BookingConfirmed />} />
            <Route path="/patient-dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/about" element={<About />} />
            <Route path="/soins" element={<Soins />} />
            <Route path="/expertise" element={<Expertise />} />
            <Route path="/equipe" element={<Equipe />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<ProtectedRoute staffOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminOverview />} />
              <Route path="doctors" element={<PermissionRoute module="Doctors"><AdminDoctors /></PermissionRoute>} />
              <Route path="doctors/new" element={<PermissionRoute module="Doctors" action="create"><AdminDoctorAdd /></PermissionRoute>} />
              <Route path="doctors/details" element={<PermissionRoute module="Doctors"><AdminDoctorDetails /></PermissionRoute>} />
              <Route path="doctors/details/:id" element={<PermissionRoute module="Doctors"><AdminDoctorDetails /></PermissionRoute>} />
              <Route path="doctors/schedule" element={<PermissionRoute module="Doctors" action="edit"><AdminDoctorSchedule /></PermissionRoute>} />
              <Route path="doctors/schedule/:id" element={<PermissionRoute module="Doctors" action="edit"><AdminDoctorSchedule /></PermissionRoute>} />
              <Route path="appointments" element={<PermissionRoute module="Appointments"><AdminAppointments /></PermissionRoute>} />
              <Route path="appointments/new" element={<PermissionRoute module="Appointments" action="create"><AdminAppointmentNew /></PermissionRoute>} />
              <Route path="appointments/calendar" element={<PermissionRoute module="Appointments"><AdminAppointmentCalendar /></PermissionRoute>} />
              <Route path="appointments/kanban" element={<PermissionRoute module="Appointments"><AdminAppointmentKanban /></PermissionRoute>} />
              <Route path="appointments/requests" element={<PermissionRoute module="Appointments"><AdminAppointmentRequests /></PermissionRoute>} />
              <Route path="patients" element={<PermissionRoute module="Patients"><AdminPatients /></PermissionRoute>} />
              <Route path="patients/details" element={<PermissionRoute module="Patients"><AdminPatientDetails /></PermissionRoute>} />
              <Route path="patients/details/:id" element={<PermissionRoute module="Patients"><AdminPatientDetails /></PermissionRoute>} />
              <Route path="patients/create" element={<PermissionRoute module="Patients" action="create"><AdminPatientCreate /></PermissionRoute>} />
              <Route path="patients/approvals" element={<PermissionRoute module="Patients" action="edit"><AdminApprovals /></PermissionRoute>} />
              <Route path="specialties" element={<PermissionRoute module="Specialties"><AdminSpecialties /></PermissionRoute>} />
              <Route path="clinics" element={<PermissionRoute module="Clinics"><AdminClinics /></PermissionRoute>} />
              <Route path="clinics/audit" element={<PermissionRoute module="Clinics"><AdminClinicAudit /></PermissionRoute>} />
              <Route path="blog" element={<PermissionRoute module="Blog"><AdminBlog /></PermissionRoute>} />
              <Route path="messages" element={<PermissionRoute module="Messages"><AdminMessages /></PermissionRoute>} />
              <Route path="billing" element={<PermissionRoute module="Billing"><BillingDashboard /></PermissionRoute>} />
              <Route path="billing/invoices" element={<PermissionRoute module="Billing"><Invoices /></PermissionRoute>} />
              <Route path="billing/invoices/new" element={<PermissionRoute module="Billing" action="create"><CreateInvoice /></PermissionRoute>} />
              <Route path="billing/invoices/:id" element={<PermissionRoute module="Billing"><InvoiceDetails /></PermissionRoute>} />
              <Route path="billing/payments" element={<PermissionRoute module="Billing"><Payments /></PermissionRoute>} />
              <Route path="billing/services" element={<PermissionRoute module="Billing"><Services /></PermissionRoute>} />
              <Route path="billing/categories" element={<PermissionRoute module="Billing"><Categories /></PermissionRoute>} />
              <Route path="verify-assistants" element={<ProtectedRoute adminOnly><AdminAssistantVerifier /></ProtectedRoute>} />
              <Route path="roles" element={<ProtectedRoute adminOnly><AdminRoles /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
              <Route path="delete-requests" element={<ProtectedRoute adminOnly><AdminDeleteRequests /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
              <Route path="pages" element={<ProtectedRoute adminOnly><AdminPages /></ProtectedRoute>} />
              <Route path="media" element={<ProtectedRoute adminOnly><AdminMediaLibrary /></ProtectedRoute>} />
              <Route path="location" element={<ProtectedRoute adminOnly><AdminLocation /></ProtectedRoute>} />
              <Route path="testimonials" element={<ProtectedRoute adminOnly><AdminTestimonials /></ProtectedRoute>} />
              <Route path="faq" element={<ProtectedRoute adminOnly><AdminFaq /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><PermissionRoute module="settings" action="edit"><AdminSettings /></PermissionRoute></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AppSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
