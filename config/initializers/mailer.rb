ActionMailer::Base.smtp_settings = {
  :address => "smtp.gmail.com",
  :port => 587,
  :authentication => :plain,
  :enable_starttls_auto => true,
  :user_name => "noreply@cliiz.com",
  :password => "yxshape000"
}
ActionMailer::Base.default_url_options = { :host => 'cliiz.com' }
