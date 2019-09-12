class User < ActiveRecord::Base
	
	validates_length_of       :password, maximum: 72, minimum: 6, allow_nil: true, allow_blank: false
	
	validates_presence_of     :username
	validates_presence_of     :email
  validates_presence_of     :password
  validates_presence_of     :deviceId
  validates_presence_of     :deviceType
  validates_uniqueness_of   :email
end
