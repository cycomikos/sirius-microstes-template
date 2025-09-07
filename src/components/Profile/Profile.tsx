import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalciteCard, CalciteInput, CalciteButton, CalciteChip, CalciteIcon, CalciteBlock, CalciteNotice } from '@esri/calcite-components-react';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation, TranslationKey, Language } from '../../utils/translations';
import { calculateLayoutStyles } from '../../utils/componentHelpers';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import './Profile.css';

interface ProfileProps {
  currentLanguage: Language;
  sidebarExpanded: boolean;
  panelWidth: number;
}

const t = (key: TranslationKey, language: Language) => getTranslation(key, language);

const Profile: React.FC<ProfileProps> = ({ 
  currentLanguage, 
  sidebarExpanded, 
  panelWidth 
}) => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: state.user?.fullName || '',
    email: state.user?.username || '',
    department: t('defaultDepartment', currentLanguage),
    location: t('defaultLocation', currentLanguage),
    phone: '+60 3-2331-8888',
    jobTitle: t('defaultJobTitle', currentLanguage),
    supervisor: t('defaultSupervisor', currentLanguage),
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userInitials = (state.user?.fullName || 'User')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const layoutStyles = calculateLayoutStyles(sidebarExpanded, panelWidth);

  const breadcrumbItems = [
    { 
      label: t('home', currentLanguage), 
      href: '/',
      ariaLabel: `${t('home', currentLanguage)} - Navigate to home page`
    },
    { 
      label: t('profileTitle', currentLanguage), 
      isActive: true,
      ariaLabel: `${t('profileTitle', currentLanguage)} - Current page`
    }
  ];

  const handleBreadcrumbNavigate = (href: string) => {
    navigate(href);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    setSuccessMessage(t('profileUpdated', currentLanguage));
    setErrorMessage(null);
    setIsEditing(false);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage(t('passwordMismatch', currentLanguage));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setErrorMessage(t('passwordTooShort', currentLanguage));
      return;
    }
    
    setSuccessMessage(t('passwordChanged', currentLanguage));
    setErrorMessage(null);
    setShowPasswordForm(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: state.user?.fullName || '',
      email: state.user?.username || '',
      department: t('defaultDepartment', currentLanguage),
      location: t('defaultLocation', currentLanguage),
      phone: '+60 3-2331-8888',
      jobTitle: t('defaultJobTitle', currentLanguage),
      supervisor: t('defaultSupervisor', currentLanguage),
    });
    setIsEditing(false);
  };

  return (
    <main className="content-area" style={layoutStyles}>
      <div className="content-wrapper">
        <Breadcrumb 
          items={breadcrumbItems} 
          currentLanguage={currentLanguage}
          onNavigate={handleBreadcrumbNavigate}
        />

        <div className="profile-header-section">
          <h1 className="page-title">{t('profileTitle', currentLanguage)}</h1>
          <p className="page-subtitle">{t('profileSubtitle', currentLanguage)}</p>
        </div>

        {successMessage && (
          <div className="notification success-notification">
            <CalciteIcon icon="check-circle" scale="s" />
            <span>{successMessage}</span>
            <button 
              className="notification-close" 
              onClick={() => setSuccessMessage(null)}
              aria-label={t('closeNotification', currentLanguage)}
            >
              <CalciteIcon icon="x" scale="s" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="notification error-notification">
            <CalciteIcon icon="exclamation-mark-triangle" scale="s" />
            <span>{errorMessage}</span>
            <button 
              className="notification-close" 
              onClick={() => setErrorMessage(null)}
              aria-label={t('closeNotification', currentLanguage)}
            >
              <CalciteIcon icon="x" scale="s" />
            </button>
          </div>
        )}

        <div className="profile-grid">
          {/* Profile Overview Card */}
          <div className="profile-card profile-overview-card">
            <div className="card-header">
              <h2 className="card-title">{t('profileOverview', currentLanguage)}</h2>
            </div>
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {userInitials}
              </div>
              <div className="profile-info">
                <h3 className="user-name">{state.user?.fullName || t('userName', currentLanguage)}</h3>
                <p className="user-email">{state.user?.username || t('userEmail', currentLanguage)}</p>
                <div className="profile-groups">
                  {state.user?.groups.map((group, index) => (
                    <span key={index} className="group-chip">
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2 className="card-title">{t('personalInformation', currentLanguage)}</h2>
              <p className="card-subtitle">{t('personalInformationSubtitle', currentLanguage)}</p>
            </div>
            
            <div className="card-body">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="fullName">{t('fullName', currentLanguage)}</label>
                  <input
                    id="fullName"
                    type="text"
                    className="form-input"
                    value={formData.fullName}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="email">{t('email', currentLanguage)}</label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    disabled={true}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="phone">{t('phone', currentLanguage)}</label>
                  <input
                    id="phone"
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="location">{t('location', currentLanguage)}</label>
                  <input
                    id="location"
                    type="text"
                    className="form-input"
                    value={formData.location}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-actions">
                {!isEditing ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    <CalciteIcon icon="pencil" scale="s" />
                    {t('editProfile', currentLanguage)}
                  </button>
                ) : (
                  <div className="btn-group">
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      {t('cancel', currentLanguage)}
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveProfile}
                    >
                      <CalciteIcon icon="save" scale="s" />
                      {t('saveChanges', currentLanguage)}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Work Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2 className="card-title">{t('workInformation', currentLanguage)}</h2>
              <p className="card-subtitle">{t('workInformationSubtitle', currentLanguage)}</p>
            </div>
            
            <div className="card-body">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="jobTitle">{t('jobTitle', currentLanguage)}</label>
                  <input
                    id="jobTitle"
                    type="text"
                    className="form-input"
                    value={formData.jobTitle}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="department">{t('department', currentLanguage)}</label>
                  <input
                    id="department"
                    type="text"
                    className="form-input"
                    value={formData.department}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="supervisor">{t('supervisor', currentLanguage)}</label>
                  <input
                    id="supervisor"
                    type="text"
                    className="form-input"
                    value={formData.supervisor}
                    disabled={!isEditing}
                    onChange={(e) => handleInputChange('supervisor', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2 className="card-title">{t('securitySettings', currentLanguage)}</h2>
              <p className="card-subtitle">{t('securitySettingsSubtitle', currentLanguage)}</p>
            </div>
            
            <div className="card-body">
              {!showPasswordForm ? (
                <div className="security-info">
                  <div className="security-item">
                    <CalciteIcon icon="key" scale="s" />
                    <div>
                      <p className="security-label">{t('password', currentLanguage)}</p>
                      <span className="security-detail">{t('lastChanged', currentLanguage)} 30 {t('daysAgo', currentLanguage)}</span>
                    </div>
                  </div>
                  <div className="security-item">
                    <CalciteIcon icon="clock" scale="s" />
                    <div>
                      <p className="security-label">{t('lastLogin', currentLanguage)}</p>
                      <span className="security-detail">{t('today', currentLanguage)} {t('at', currentLanguage)} 9:15 AM</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    <CalciteIcon icon="key" scale="s" />
                    {t('changePassword', currentLanguage)}
                  </button>
                </div>
              ) : (
                <div className="password-form">
                  <div className="form-grid">
                    <div className="form-field">
                      <label htmlFor="currentPassword">{t('currentPassword', currentLanguage)}</label>
                      <input
                        id="currentPassword"
                        type="password"
                        className="form-input"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="newPassword">{t('newPassword', currentLanguage)}</label>
                      <input
                        id="newPassword"
                        type="password"
                        className="form-input"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="confirmPassword">{t('confirmPassword', currentLanguage)}</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="form-input"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <div className="btn-group">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                      >
                        {t('cancel', currentLanguage)}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleChangePassword}
                      >
                        <CalciteIcon icon="save" scale="s" />
                        {t('updatePassword', currentLanguage)}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2 className="card-title">{t('recentActivity', currentLanguage)}</h2>
              <p className="card-subtitle">{t('recentActivitySubtitle', currentLanguage)}</p>
            </div>
            
            <div className="card-body">
              <div className="activity-list">
                <div className="activity-item">
                  <CalciteIcon icon="map" scale="s" />
                  <div className="activity-content">
                    <p className="activity-title">{t('viewedRefinery', currentLanguage)}</p>
                    <span className="activity-time">2 {t('hoursAgo', currentLanguage)}</span>
                  </div>
                </div>
                
                <div className="activity-item">
                  <CalciteIcon icon="user" scale="s" />
                  <div className="activity-content">
                    <p className="activity-title">{t('updatedProfile', currentLanguage)}</p>
                    <span className="activity-time">1 {t('dayAgo', currentLanguage)}</span>
                  </div>
                </div>
                
                <div className="activity-item">
                  <CalciteIcon icon="download" scale="s" />
                  <div className="activity-content">
                    <p className="activity-title">{t('downloadedReport', currentLanguage)}</p>
                    <span className="activity-time">3 {t('daysAgo', currentLanguage)}</span>
                  </div>
                </div>
                
                <div className="activity-item">
                  <CalciteIcon icon="sign-in" scale="s" />
                  <div className="activity-content">
                    <p className="activity-title">{t('signedIn', currentLanguage)}</p>
                    <span className="activity-time">1 {t('weekAgo', currentLanguage)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;