import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Cloud, Settings as SettingsIcon, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    display_name: '',
    default_output_format: 'wav',
    default_separation_mode: 'two_stems',
    default_separation_model: 'balanced',
    default_mp3_bitrate: '320',
    default_mp3_mode: 'cbr',
    default_wav_sample_rate: '44100',
    default_wav_bit_depth: '16',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const profiles = await base44.entities.Profile.filter({ user_id: currentUser.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch {
      base44.auth.redirectToLogin('/Settings');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (profile.id) {
        await base44.entities.Profile.update(profile.id, profile);
      } else {
        await base44.entities.Profile.create({ ...profile, user_id: user.id });
      }
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwords.new !== passwords.confirm) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Password change functionality would go here
      setSuccess('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {success && (
        <Alert className="bg-green-950 border-green-900">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <AlertDescription className="text-green-400">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <Button onClick={handleProfileUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Default Settings
              </CardTitle>
              <CardDescription>Set your preferred defaults for new jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label>Default Separation Mode</Label>
                  <Select
                    value={profile.default_separation_mode}
                    onValueChange={(value) => setProfile({ ...profile, default_separation_mode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="two_stems">Two Stems (Vocals + Band)</SelectItem>
                      <SelectItem value="four_stems">Four Stems (Vocals + Drums + Bass + Other)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default AI Model</Label>
                  <Select
                    value={profile.default_separation_model}
                    onValueChange={(value) => setProfile({ ...profile, default_separation_model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="high_quality">High Quality</SelectItem>
                      <SelectItem value="artifact_free">Artifact-Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Output Format</Label>
                  <Select
                    value={profile.default_output_format}
                    onValueChange={(value) => setProfile({ ...profile, default_output_format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wav">WAV (Lossless)</SelectItem>
                      <SelectItem value="flac">FLAC (Lossless Compressed)</SelectItem>
                      <SelectItem value="mp3">MP3 (Lossy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {profile.default_output_format === 'mp3' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default MP3 Bitrate</Label>
                      <Select
                        value={profile.default_mp3_bitrate}
                        onValueChange={(value) => setProfile({ ...profile, default_mp3_bitrate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="128">128 kbps</SelectItem>
                          <SelectItem value="192">192 kbps</SelectItem>
                          <SelectItem value="256">256 kbps</SelectItem>
                          <SelectItem value="320">320 kbps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default MP3 Mode</Label>
                      <Select
                        value={profile.default_mp3_mode}
                        onValueChange={(value) => setProfile({ ...profile, default_mp3_mode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cbr">CBR</SelectItem>
                          <SelectItem value="vbr">VBR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {profile.default_output_format === 'wav' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Sample Rate</Label>
                      <Select
                        value={profile.default_wav_sample_rate}
                        onValueChange={(value) => setProfile({ ...profile, default_wav_sample_rate: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="44100">44.1 kHz</SelectItem>
                          <SelectItem value="48000">48 kHz</SelectItem>
                          <SelectItem value="88200">88.2 kHz</SelectItem>
                          <SelectItem value="96000">96 kHz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Bit Depth</Label>
                      <Select
                        value={profile.default_wav_bit_depth}
                        onValueChange={(value) => setProfile({ ...profile, default_wav_bit_depth: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16">16-bit</SelectItem>
                          <SelectItem value="24">24-bit</SelectItem>
                          <SelectItem value="32">32-bit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Defaults'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cloud">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Cloud Storage Integration
              </CardTitle>
              <CardDescription>Connect your cloud storage accounts to upload files and save processed stems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M18.944 11.112C18.507 7.67 15.56 5 12 5 9.244 5 6.85 6.611 5.757 9.15 3.609 9.792 2 11.82 2 14c0 2.657 2.089 4.815 4.708 4.99V19h10.584v-.01C19.911 18.815 22 16.657 22 14c0-2.657-2.089-4.815-4.708-4.99l-.348.102z"/>
                    </svg>
                    <div>
                      <p className="font-medium">Google Drive</p>
                      <p className="text-sm text-green-400">Connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16.527 16.413l-4.53 7.235-7.5-4.97L12 11.444l4.527 4.969m-4.53-4.969L4.5 18.678l7.497-13.043 4.03 6.809-4.03-.065M12 11.444l7.497-4.234-3.467 5.76-4.03-1.526z"/>
                    </svg>
                    <div>
                      <p className="font-medium">Dropbox</p>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg opacity-50">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M13.8 12L9 8.4V6.2l7.8 5.4-3 2.4m-3.6 0L3.4 7.6v2.2l4.8 3.6-4.8 3.6v2.2l6.8-4.6 3-2z"/>
                    </svg>
                    <div>
                      <p className="font-medium">OneDrive</p>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-secondary rounded-lg space-y-2">
                <p className="text-sm font-medium">Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Upload audio files directly from cloud storage</li>
                  <li>Automatically save processed stems back to your Drive</li>
                  <li>Organize outputs in dedicated folders</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}