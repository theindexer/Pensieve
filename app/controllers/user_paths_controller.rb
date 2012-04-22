class UserPathsController < ApplicationController
  # GET /user_paths
  # GET /user_paths.json
  def index
    @user_paths = UserPath.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @user_paths }
    end
  end

  # GET /user_paths/1
  # GET /user_paths/1.json
  def show
    @user_path = UserPath.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @user_path }
    end
  end

  # GET /user_paths/new
  # GET /user_paths/new.json
  def new
    @user_path = UserPath.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @user_path }
    end
  end

  # GET /user_paths/1/edit
  def edit
    @user_path = UserPath.find(params[:id])
  end

  # POST /user_paths
  # POST /user_paths.json
  def create
    @user_path = UserPath.new(params[:user_path])

    respond_to do |format|
      if @user_path.save
        format.html { redirect_to @user_path, notice: 'User path was successfully created.' }
        format.json { render json: @user_path, status: :created, location: @user_path }
      else
        format.html { render action: "new" }
        format.json { render json: @user_path.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /user_paths/1
  # PUT /user_paths/1.json
  def update
    @user_path = UserPath.find(params[:id])

    respond_to do |format|
      if @user_path.update_attributes(params[:user_path])
        format.html { redirect_to @user_path, notice: 'User path was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @user_path.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /user_paths/1
  # DELETE /user_paths/1.json
  def destroy
    @user_path = UserPath.find(params[:id])
    @user_path.destroy

    respond_to do |format|
      format.html { redirect_to user_paths_url }
      format.json { head :no_content }
    end
  end
end
