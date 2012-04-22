class ProfileController < ApplicationController
  def showProfile
    @user = User.find(params[:id])
    @paths = @user.paths
    respond_to do |format|
      format.html
    end
  end
end
