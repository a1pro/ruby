class Postsetting < ActiveRecord::Base
	
 mount_uploader :attachment, AttachmentUploader
 
 validates_presence_of     :posttype
	validates_presence_of     :author
  validates_presence_of     :attachment
  validates_presence_of     :attachmenttype
  validates_presence_of     :title
  
	
end
