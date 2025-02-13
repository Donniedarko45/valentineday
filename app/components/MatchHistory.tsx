import { motion } from 'framer-motion';
import Image from 'next/image';

interface MatchHistoryProps {
  history: Array<{
    senderUsername: string;
    partnerUsername: string;
    platform: 'instagram' | 'x';
    matchPercentage: number;
    flirtMessage: string;
    senderImage: string;
    partnerImage: string;
    date: string;
  }>;
  onSelectMatch: (match: any) => void;
}

export default function MatchHistory({ history, onSelectMatch }: MatchHistoryProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-pink-200 mb-4">Your Previous Matches</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {history.map((match, index) => (
          <motion.div
            key={match.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-pink-950/30 backdrop-blur-sm rounded-xl p-4 border border-pink-500/20 cursor-pointer hover:border-pink-500/40 transition-all"
            onClick={() => onSelectMatch(match)}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="flex -space-x-4">
                <Image
                  src={match.senderImage}
                  alt={match.senderUsername}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-pink-500"
                />
                <Image
                  src={match.partnerImage}
                  alt={match.partnerUsername}
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-pink-500"
                />
              </div>
              <div className="flex-1">
                <p className="text-pink-200 font-medium">
                  {match.senderUsername} & {match.partnerUsername}
                </p>
                <p className="text-pink-300/80 text-sm">
                  {new Date(match.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-xl font-bold text-pink-500">
                {match.matchPercentage}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 