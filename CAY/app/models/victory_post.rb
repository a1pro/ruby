class VictoryPost < ActiveRecord::Base
	
	mount_uploader :attachment, AttachmentUploader

  validates_presence_of     :userid
  validates_presence_of     :description
  validates_presence_of     :image
  validates_presence_of     :victory_type
  validates_presence_of     :title
	
end
