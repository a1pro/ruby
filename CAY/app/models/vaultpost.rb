class Vaultpost < ActiveRecord::Base

#mount_uploader :attachment, AttachmentUploader

	validates_presence_of     :tag
	validates_presence_of     :url
  validates_presence_of     :attachment
 # validates_presence_of     :attachmenttype
  validates_presence_of     :title
  
	
end
