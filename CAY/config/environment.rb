# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Initialize the Rails application.
Rails.application.initialize!

require 'carrierwave/orm/activerecord'

CarrierWave.configure do |config|
  config.permissions = 0666
  config.directory_permissions = 0777
  config.storage = :file
end
#ActionMailer::Base.default_content_type = "text/html"

# config.user_mailer.delivery_method = :smtp

# config.user_mailer.smtp_settings = {
   # address:              'smtp.gmail.com',
   # port:                 587,
   # domain:               'example.com',
   # user_name:            'ewebteam1@gmail.com',
   # password:             'plokijuh12345',
   # authentication:       'plain',
   # enable_starttls_auto: true  
# }