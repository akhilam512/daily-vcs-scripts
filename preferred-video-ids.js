import * as React from 'react';
import { RoomContext } from '#vcs-react/contexts';

export function usePreferredParticipantIdsParam(
  params,
  dominantVideoId,
  hasScreenShare
) {
  const { availablePeers } = React.useContext(RoomContext);

  // Get the preferred participant IDs from params
  const preferredParticipantIdsStr =
    params['videoSettings.preferredParticipantIds'];
  const preferScreenshare = params['videoSettings.preferScreenshare'];

  const preferredVideoIds = React.useMemo(() => {
    const wantedIds = parseCommaSeparatedList(preferredParticipantIdsStr);
    const pref = [];
    
    if (hasScreenShare) {
      const peerWithSshare = availablePeers.find((p) => p.screenshareVideo?.id);
      if (peerWithSshare) pref.push(peerWithSshare.screenshareVideo.id);
    }

    for (const wantedId of wantedIds) {
      const p = availablePeers.find((p) => p.id === wantedId);
      if (!p) continue;
      if (!p.video && !p.screenshareVideo) continue;

      pref.push(
        preferScreenshare && p.screenshareVideo && p.screenshareVideo.id
          ? p.screenshareVideo.id
          : p.video.id
      );
    }

    if (dominantVideoId) pref.push(dominantVideoId);

    return pref;
  }, [availablePeers, preferredParticipantIdsStr, preferScreenshare, dominantVideoId, hasScreenShare]);

  return {
    preferredVideoIds: preferredVideoIds,
    includeOtherVideoIds: true,
  };
}

function parseCommaSeparatedList(str) {
  if (!str || str.length < 1) return [];

  return str.split(',').map((s) => s.trim());
}
