import { type FormEvent, useEffect, useState } from 'react';
import { httpGet, httpPatch } from '../../lib/http';
import { pageProgressMessage } from '../../stores/page';
import type {
  AllowedCustomRoadmapVisibility,
  AllowedProfileVisibility,
  AllowedRoadmapVisibility,
  UserDocument,
} from '../../api/user';
import { SelectionButton } from '../RoadCard/SelectionButton';
import { ArrowUpRight } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

type RoadmapType = {
  id: string;
  title: string;
  isCustomResource: boolean;
};

type GetProfileSettingsResponse = Pick<
  UserDocument,
  'username' | 'profileVisibility' | 'publicConfig' | 'links'
>;

export function UpdatePublicProfileForm() {
  const [profileVisibility, setProfileVisibility] =
    useState<AllowedProfileVisibility>('private');

  const toast = useToast();

  const [headline, setHeadline] = useState('');
  const [username, setUsername] = useState('');
  const [roadmapVisibility, setRoadmapVisibility] =
    useState<AllowedRoadmapVisibility>('none');
  const [customRoadmapVisibility, setCustomRoadmapVisibility] =
    useState<AllowedCustomRoadmapVisibility>('none');
  const [roadmaps, setRoadmaps] = useState<string[]>([]);
  const [customRoadmaps, setCustomRoadmaps] = useState<string[]>([]);

  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');

  const [profileRoadmaps, setProfileRoadmaps] = useState<RoadmapType[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { response, error } = await httpPatch(
      `${import.meta.env.PUBLIC_API_URL}/v1-update-public-profile-config`,
      {
        profileVisibility,
        headline,
        username,
        roadmapVisibility,
        customRoadmapVisibility,
        roadmaps,
        customRoadmaps,
        github,
        twitter,
        linkedin,
        website,
      },
    );

    if (error || !response) {
      setIsLoading(false);
      toast.error(error?.message || 'Something went wrong');

      return;
    }

    await loadProfileSettings();
    toast.success('Profile updated successfully');
  };

  const loadProfileSettings = async () => {
    setIsLoading(true);

    const { error, response } = await httpGet<UserDocument>(
      `${import.meta.env.PUBLIC_API_URL}/v1-get-profile-settings`,
    );

    if (error || !response) {
      setIsLoading(false);
      toast.error(error?.message || 'Something went wrong');

      return;
    }

    const {
      links,
      username,
      profileVisibility: defaultProfileVisibility,
      publicConfig,
    } = response;
    setUsername(username || '');
    setGithub(links?.github || '');
    setTwitter(links?.twitter || '');
    setLinkedin(links?.linkedin || '');
    setWebsite(links?.website || '');
    setProfileVisibility(defaultProfileVisibility || 'private');
    setHeadline(publicConfig?.headline || '');
    setRoadmapVisibility(publicConfig?.roadmapVisibility || 'none');
    setCustomRoadmapVisibility(publicConfig?.customRoadmapVisibility || 'none');
    setCustomRoadmaps(publicConfig?.customRoadmaps || []);
    setRoadmaps(publicConfig?.roadmaps || []);
    setCustomRoadmapVisibility(publicConfig?.customRoadmapVisibility || 'none');

    setIsLoading(false);
  };

  const loadProfileRoadmaps = async () => {
    setIsLoading(true);

    const { error, response } = await httpGet<{
      roadmaps: RoadmapType[];
    }>(`${import.meta.env.PUBLIC_API_URL}/v1-get-profile-roadmaps`);

    if (error || !response) {
      setIsLoading(false);
      toast.error(error?.message || 'Something went wrong');

      return;
    }

    setProfileRoadmaps(response?.roadmaps || []);
    setIsLoading(false);
  };

  // Make a request to the backend to fill in the form with the current values
  useEffect(() => {
    Promise.all([loadProfileSettings(), loadProfileRoadmaps()]).finally(() => {
      pageProgressMessage.set('');
    });
  }, []);

  const publicCustomRoadmaps = profileRoadmaps.filter(
    (r) => r.isCustomResource,
  );
  const publicRoadmaps = profileRoadmaps.filter((r) => !r.isCustomResource);

  const publicProfileUrl = `/u/${username}`;

  return (
    <form className="mt-16 space-y-4 pb-10" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-3xl font-bold">Public Profile</h3>
          {profileVisibility === 'public' && username && (
            <a href={publicProfileUrl} className="shrink-0">
              <ArrowUpRight className="h-6 w-6 stroke-[3]" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SelectionButton
            type="button"
            text="Public"
            isDisabled={profileVisibility === 'public'}
            isSelected={profileVisibility === 'public'}
            onClick={() => setProfileVisibility('public')}
          />
          <SelectionButton
            type="button"
            text="Private"
            isDisabled={profileVisibility === 'private'}
            isSelected={profileVisibility === 'private'}
            onClick={() => setProfileVisibility('private')}
          />
        </div>
      </div>

      {profileVisibility === 'public' && (
        <>
          <div className="flex w-full flex-col">
            <label
              htmlFor="headline"
              className="text-sm leading-none text-slate-500"
            >
              Headline
            </label>
            <input
              type="text"
              name="headline"
              id="headline"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
              placeholder="Full Stack Developer"
              value={headline}
              onChange={(e) =>
                setHeadline((e.target as HTMLInputElement).value)
              }
              required={profileVisibility === 'public'}
            />
          </div>
          <div className="flex w-full flex-col">
            <label
              htmlFor="username"
              className="text-sm leading-none text-slate-500"
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
              placeholder="johndoe"
              value={username}
              onChange={(e) =>
                setUsername((e.target as HTMLInputElement).value)
              }
              required={profileVisibility === 'public'}
            />
          </div>

          <div className="rounded-md border p-4">
            <h3 className="text-sm font-medium">Show my Learning Activity</h3>
            <div className="mt-3 flex items-center gap-2">
              <SelectionButton
                type="button"
                text="All Roadmaps"
                isDisabled={roadmapVisibility === 'all'}
                isSelected={roadmapVisibility === 'all'}
                onClick={() => setRoadmapVisibility('all')}
              />
              <SelectionButton
                type="button"
                text="Hide my Activity"
                isDisabled={roadmapVisibility === 'none'}
                isSelected={roadmapVisibility === 'none'}
                onClick={() => setRoadmapVisibility('none')}
              />
            </div>

            <h3 className="mt-4 text-sm font-medium">
              Only Following Roadmaps
            </h3>
            {publicRoadmaps.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {publicRoadmaps.map((r) => (
                  <SelectionButton
                    type="button"
                    key={r.id}
                    text={r.title}
                    isDisabled={false}
                    isSelected={roadmaps.includes(r.id)}
                    onClick={() => {
                      if (roadmapVisibility !== 'selected') {
                        setRoadmapVisibility('selected');
                      }

                      if (roadmaps.includes(r.id)) {
                        setRoadmaps(roadmaps.filter((id) => id !== r.id));
                      } else {
                        setRoadmaps([...roadmaps, r.id]);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-lg bg-yellow-100 p-2 text-yellow-700">
                You are not following any roadmaps yet.{' '}
                <a href="/roadmaps" className="text-black underline">
                  Start following roadmaps
                </a>
              </p>
            )}
          </div>

          <div className="rounded-md border p-4">
            <h3 className="text-sm font-medium">Show my Custom Roadmaps</h3>
            <div className="mt-3 flex items-center gap-2">
              <SelectionButton
                type="button"
                text="All Roadmaps"
                isDisabled={customRoadmapVisibility === 'all'}
                isSelected={customRoadmapVisibility === 'all'}
                onClick={() => setCustomRoadmapVisibility('all')}
              />
              <SelectionButton
                type="button"
                text="Hide my Custom Roadmaps"
                isDisabled={customRoadmapVisibility === 'none'}
                isSelected={customRoadmapVisibility === 'none'}
                onClick={() => setCustomRoadmapVisibility('none')}
              />
            </div>

            <h3 className="mt-4 text-sm font-medium">
              Only Following Roadmaps
            </h3>
            {publicCustomRoadmaps.length > 0 ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {publicCustomRoadmaps.map((r) => (
                  <SelectionButton
                    type="button"
                    key={r.id}
                    text={r.title}
                    isDisabled={false}
                    isSelected={customRoadmaps.includes(r.id)}
                    onClick={() => {
                      if (customRoadmapVisibility !== 'selected') {
                        setCustomRoadmapVisibility('selected');
                      }

                      if (customRoadmaps.includes(r.id)) {
                        setCustomRoadmaps(
                          customRoadmaps.filter((id) => id !== r.id),
                        );
                      } else {
                        setCustomRoadmaps([...customRoadmaps, r.id]);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-lg bg-yellow-100 p-2 text-yellow-700">
                You have not created any custom roadmaps yet.{' '}
                <a href="/roadmaps" className="text-black underline">
                  Create a custom roadmap
                </a>
              </p>
            )}
          </div>

          <div className="flex w-full flex-col">
            <label
              htmlFor="github"
              className="text-sm leading-none text-slate-500"
            >
              Github
            </label>
            <input
              type="text"
              name="github"
              id="github"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
              placeholder="https://github.com/username"
              value={github}
              onChange={(e) => setGithub((e.target as HTMLInputElement).value)}
            />
          </div>
          <div className="flex w-full flex-col">
            <label
              htmlFor="twitter"
              className="text-sm leading-none text-slate-500"
            >
              Twitter
            </label>
            <input
              type="text"
              name="twitter"
              id="twitter"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
              placeholder="https://twitter.com/username"
              value={twitter}
              onChange={(e) => setTwitter((e.target as HTMLInputElement).value)}
            />
          </div>

          <div className="flex w-full flex-col">
            <label
              htmlFor="linkedin"
              className="text-sm leading-none text-slate-500"
            >
              LinkedIn
            </label>
            <input
              type="text"
              name="linkedin"
              id="linkedin"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
              placeholder="https://www.linkedin.com/in/username/"
              value={linkedin}
              onChange={(e) =>
                setLinkedin((e.target as HTMLInputElement).value)
              }
            />
          </div>

          <div className="flex w-full flex-col">
            <label
              htmlFor="website"
              className="text-sm leading-none text-slate-500"
            >
              Website
            </label>
            <input
              type="text"
              name="website"
              id="website"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite((e.target as HTMLInputElement).value)}
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-black p-2 py-3 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 disabled:bg-gray-400"
      >
        {isLoading ? 'Please wait...' : 'Update Public Profile'}
      </button>
    </form>
  );
}
