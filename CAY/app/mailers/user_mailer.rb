class UserMailer < ApplicationMailer
	default from: 'ewebteam1@gmail.com'
	layout "hello_email"

  def hello_email(user)
  @user = user
  @url  = 'http://www.gmail.com'
   # mail(to: email, subject: 'Hello')
	 mail( :to => @user.email,
          :subject => 'Forget Password',
        ) 
	
  end
end
