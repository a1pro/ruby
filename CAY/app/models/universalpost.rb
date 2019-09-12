class Universalpost < ActiveRecord::Base
 #mount_uploader :file, FileUploader # Tells rails to use this uploader for this model	
	
	validates_presence_of     :tag
	validates_presence_of     :url
  validates_presence_of     :file
  validates_presence_of     :filetype
  validates_presence_of     :title
  validates_presence_of     :status
  validates_presence_of     :source	

end
