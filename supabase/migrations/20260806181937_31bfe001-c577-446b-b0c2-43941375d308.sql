-- Update constraint to include cookie-policy
ALTER TABLE public.legal_pages DROP CONSTRAINT legal_pages_page_type_check;
ALTER TABLE public.legal_pages ADD CONSTRAINT legal_pages_page_type_check CHECK (page_type IN ('terms', 'privacy', 'cookie-policy'));

-- Insert initial Cookie Policy content
INSERT INTO public.legal_pages (page_type, title, slug, version, content)
VALUES 
(
  'cookie-policy', 
  'Cookie Policy', 
  'cookie-policy', 
  '1.0.0', 
  '{
    "subtitle": "How we use cookies to improve your experience at La Dune.",
    "estimated_reading_time": "4 min",
    "sections": [
      {
        "title": "1. What are Cookies?",
        "content": "Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences, keep you signed in, and understand how people use our platform."
      },
      {
        "title": "2. Essential Cookies",
        "content": "These cookies are strictly necessary for the operation of HealthBook. They enable basic functions like security, network management, and accessibility. You cannot opt out of these cookies."
      },
      {
        "title": "3. Preference Cookies",
        "content": "We use preference cookies to remember information that changes the way the site behaves or looks, such as your preferred language or the region you are in."
      },
      {
        "title": "4. Performance & Analytics",
        "content": "These cookies help us understand how visitors interact with the site by collecting and reporting information anonymously. This helps us identify technical issues and improve user experience."
      },
      {
        "title": "5. Third-Party Cookies",
        "content": "Some of our pages display content from external providers (like Google Maps for clinic locations). To view this third-party content, you first have to accept their specific terms and conditions, including their cookie policies."
      },
      {
        "title": "6. How to Manage Cookies",
        "content": "Most web browsers allow you to control cookies through their settings. You can choose to block all cookies, but please note that some features of HealthBook may not function correctly if you do so."
      }
    ]
  }'::jsonb
);