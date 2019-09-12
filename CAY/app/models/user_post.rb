class UserPost < ActiveRecord::Base
	
	has_one :users, :class_name => "User", :foreign_key => "id" ,:primary_key => "userid"
	
	mount_uploader :attachment, AttachmentUploader
	
  validates_presence_of     :userid
  validates_presence_of     :description
  validates_presence_of     :attachment
  validates_presence_of     :victory_type
  validates_presence_of     :title
end
