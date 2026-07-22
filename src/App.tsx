import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Doctors from "./pages/Doctors";
import Booking from "./pages/Booking";
import PatientDashboard from "./pages/PatientDashboard";
import Auth from "./pages/Auth";
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
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
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
  AdminRoles, AdminDeleteRequests, AdminReports, AdminPages,
  AdminLocation, AdminTestimonials, AdminFaq,
} from "./pages/admin/AdminStubs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/patient-dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
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
              <Route path="doctors" element={<ProtectedRoute adminOnly><AdminDoctors /></ProtectedRoute>} />
              <Route path="doctors/new" element={<ProtectedRoute adminOnly><AdminDoctorAdd /></ProtectedRoute>} />
              <Route path="doctors/details" element={<ProtectedRoute adminOnly><AdminDoctorDetails /></ProtectedRoute>} />
              <Route path="doctors/details/:id" element={<ProtectedRoute adminOnly><AdminDoctorDetails /></ProtectedRoute>} />
              <Route path="doctors/schedule" element={<ProtectedRoute adminOnly><AdminDoctorSchedule /></ProtectedRoute>} />
              <Route path="doctors/schedule/:id" element={<ProtectedRoute adminOnly><AdminDoctorSchedule /></ProtectedRoute>} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="appointments/new" element={<AdminAppointmentNew />} />
              <Route path="appointments/calendar" element={<AdminAppointmentCalendar />} />
              <Route path="appointments/kanban" element={<AdminAppointmentKanban />} />
              <Route path="appointments/requests" element={<AdminAppointmentRequests />} />
              <Route path="patients" element={<ProtectedRoute adminOnly><AdminPatients /></ProtectedRoute>} />
              <Route path="patients/details" element={<ProtectedRoute adminOnly><AdminPatientDetails /></ProtectedRoute>} />
              <Route path="patients/details/:id" element={<ProtectedRoute adminOnly><AdminPatientDetails /></ProtectedRoute>} />
              <Route path="patients/create" element={<ProtectedRoute adminOnly><AdminPatientCreate /></ProtectedRoute>} />
              <Route path="specialties" element={<ProtectedRoute adminOnly><AdminSpecialties /></ProtectedRoute>} />
              <Route path="clinics" element={<ProtectedRoute adminOnly><AdminClinics /></ProtectedRoute>} />
              <Route path="clinics/audit" element={<ProtectedRoute adminOnly><AdminClinicAudit /></ProtectedRoute>} />
              <Route path="blog" element={<ProtectedRoute adminOnly><AdminBlog /></ProtectedRoute>} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="verify-assistants" element={<ProtectedRoute adminOnly><AdminAssistantVerifier /></ProtectedRoute>} />
              <Route path="roles" element={<ProtectedRoute adminOnly><AdminRoles /></ProtectedRoute>} />
              <Route path="delete-requests" element={<ProtectedRoute adminOnly><AdminDeleteRequests /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute adminOnly><AdminReports /></ProtectedRoute>} />
              <Route path="pages" element={<ProtectedRoute adminOnly><AdminPages /></ProtectedRoute>} />
              <Route path="location" element={<ProtectedRoute adminOnly><AdminLocation /></ProtectedRoute>} />
              <Route path="testimonials" element={<ProtectedRoute adminOnly><AdminTestimonials /></ProtectedRoute>} />
              <Route path="faq" element={<ProtectedRoute adminOnly><AdminFaq /></ProtectedRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
