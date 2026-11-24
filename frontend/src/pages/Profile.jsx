
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  ShieldCheck
} from "lucide-react";

import Navbar from "../components/Navbar";
import "./Profile.css";

const API = "http://127.0.0.1:8000/api/users";

function Profile() {
  const navigate = useNavigate();

  const token = localStorage.getItem("foodiehub_token");

  const [profile, setProfile] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: ""
  });

  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, []);

  const authHeaders = {
    Authorization: `Token ${token}`,
    "Content-Type": "application/json"
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API}/profile/`, {
        headers: authHeaders
      });

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("foodiehub_token");
        localStorage.removeItem("foodiehub_user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to load profile");
      }

      setProfile(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setProfileMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/profile/`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
          phone_number: profile.phone_number
        })
      });

      const result = await response.json();

      if (!response.ok) {
        const messages = Object.values(result.errors || {})
          .flat()
          .join(", ");

        throw new Error(messages || result.message || "Profile update failed");
      }

      setProfile(result.user);

      const storedUser = JSON.parse(
        localStorage.getItem("foodiehub_user") || "{}"
      );

      localStorage.setItem(
        "foodiehub_user",
        JSON.stringify({
          ...storedUser,
          username: result.user.username,
          email: result.user.email
        })
      );

      setProfileMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setChangingPassword(true);
    setPasswordMessage("");
    setError("");

    try {
      const response = await fetch(`${API}/change-password/`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(passwords)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Password change failed");
      }

      setPasswordMessage(result.message);

      setPasswords({
        old_password: "",
        new_password: "",
        confirm_password: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="profile-loading">Loading profile...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <div className="profile-heading">
          <h1>My Profile</h1>
          <p>Manage your FoodieHub account information.</p>
        </div>

        {error && <div className="profile-error">{error}</div>}

        <div className="profile-layout">

          <section className="profile-card">
            <div className="profile-card-heading">
              <div className="profile-icon">
                <User size={25} />
              </div>

              <div>
                <h2>Personal Information</h2>
                <p>Update your personal details.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit}>
              <div className="profile-field">
                <label>Username</label>
                <div className="profile-input-wrapper">
                  <User size={18} />
                  <input
                    type="text"
                    value={profile.username}
                    disabled
                  />
                </div>
              </div>

              <div className="profile-form-row">
                <div className="profile-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={profile.first_name || ""}
                    onChange={handleProfileChange}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="profile-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={profile.last_name || ""}
                    onChange={handleProfileChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <div className="profile-input-wrapper">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={profile.email || ""}
                    onChange={handleProfileChange}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>Phone Number</label>
                <div className="profile-input-wrapper">
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="phone_number"
                    value={profile.phone_number || ""}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {profileMessage && (
                <div className="profile-success">
                  {profileMessage}
                </div>
              )}

              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </section>

          <section className="profile-card">
            <div className="profile-card-heading">
              <div className="profile-icon">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h2>Security Settings</h2>
                <p>Change your account password.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="profile-field">
                <label>Current Password</label>
                <div className="profile-input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    name="old_password"
                    value={passwords.old_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>New Password</label>
                <div className="profile-input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    name="new_password"
                    value={passwords.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              <div className="profile-field">
                <label>Confirm New Password</label>
                <div className="profile-input-wrapper">
                  <Lock size={18} />
                  <input
                    type="password"
                    name="confirm_password"
                    value={passwords.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    minLength={8}
                    required
                  />
                </div>
              </div>

              {passwordMessage && (
                <div className="profile-success">
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                className="profile-save-button"
                disabled={changingPassword}
              >
                <ShieldCheck size={18} />
                {changingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </section>

        </div>
      </main>
    </>
  );
}

export default Profile;
