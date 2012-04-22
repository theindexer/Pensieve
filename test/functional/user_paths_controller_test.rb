require 'test_helper'

class UserPathsControllerTest < ActionController::TestCase
  setup do
    @user_path = user_paths(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:user_paths)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create user_path" do
    assert_difference('UserPath.count') do
      post :create, user_path: @user_path.attributes
    end

    assert_redirected_to user_path_path(assigns(:user_path))
  end

  test "should show user_path" do
    get :show, id: @user_path
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @user_path
    assert_response :success
  end

  test "should update user_path" do
    put :update, id: @user_path, user_path: @user_path.attributes
    assert_redirected_to user_path_path(assigns(:user_path))
  end

  test "should destroy user_path" do
    assert_difference('UserPath.count', -1) do
      delete :destroy, id: @user_path
    end

    assert_redirected_to user_paths_path
  end
end
