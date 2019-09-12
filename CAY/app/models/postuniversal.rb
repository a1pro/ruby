class Postuniversal < ActiveRecord::Base
	
	
  #attr_accessor :attachment

#mount_uploader :attachment, AttachmentUploader
	
	
	
	
	
	#attr_accessible :attachment
	#mount_uploader :attachment, AttachmentUploader
	#serialize :attachment, JSON
	
	# validates_processing_of :attachment
# validate :attachment_size_validation
 
# private
  # def image_size_validation
    # errors[:attachment] << "should be less than 500KB" if attachment.size > 0.5.megabytes
  # end
	
	validates_presence_of     :tag
	validates_presence_of     :url
  validates_presence_of     :attachment
  validates_presence_of     :attachmenttype
  validates_presence_of     :title
  validates_presence_of     :status
  validates_presence_of     :source	
  
end
