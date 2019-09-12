class Featured < ActiveRecord::Base
	
	validates_presence_of     :key
	validates_presence_of     :title
  validates_presence_of     :value
end