import { supabase } from '../../utils/supabase.ts'
import { useEffect, useState } from 'react';
import { TURNS, type MatchStatus, type TurnValue } from '../../lib/types';
import Board from '../game/Board.tsx';
import { referee } from '../../logic/board.ts';

export default function Multiplayer() {

    const [roomCode, setRoomCode] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [matchId, setMatchId] = useState<string | null>(null);
    const [matchStatus, setMatchStatus] = useState<MatchStatus>('waiting');
    const [error, setError] = useState<string | null>(null);


useEffect(() =>{
    if(!matchId) return;

    const topic = `room:${matchId}:changes`;
    const channel = supabase.channel(topic, {
        config: {
            broadcast: {
                self: true,
                ack: true,
            },
        }})
        .on('broadcast', {event: 'INSERT'}, (payload) =>{
            console.log('broadcast INSERT', payload);
        })       
        .on('broadcast', {event: 'UPDATE'}, (payload) =>{
            console.log('broadcast UPDATE', payload);
        })
        .subscribe((status) =>{
            console.log('subscription status', status);
        });
        
        return () => {
            supabase.removeChannel(channel);
        };



    }, [matchId])


    const handleJoinRoom = async (e: React.MouseEvent<HTMLButtonElement>) => {

        e.preventDefault();
        const { data: gameData, error: gameError } = await supabase.from('match')
        .update({player_o_name: name, status: 'active'})
        .eq('id', roomCode)
        .select()
        .single();

        if (gameError) {
            console.error(gameError);
            setError("The room code is invalid");
            setMatchStatus('abandoned');
            return;
        }

        if (gameData) {
            console.log(gameData);
            return;
        }

        setMatchId(roomCode);

    }

    const handleCreateRoom = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if(!name) {
            setError("Your name is required to play");
            setMatchStatus('abandoned');
            return;
        } else{
            setError(null);
        }

        const {data:authData, error: authError} = await supabase.auth.signInAnonymously();

        if (authError) {
            console.error(authError);
            return;
        }


        if (authData) {
            console.log(name);
            const { data:matchData, error:matchError } = await supabase.from('match').insert({
                player_x_name: name,
            })
            .select('id')
            .single();

            if (matchError) {
                console.error(matchError);
                return;
            }
            setMatchId(matchData.id);
        }


    }

    const handleMultiplayerMove = async (board: (TurnValue | null)[]) => {
        console.log('multiplayer move', board);
        if(!matchId) return;

        const { data: matchData, error: matchError } = await supabase.from('match').update({
            board: board
        }).eq('id', matchId).select('board').single();


        if (matchError) {
            console.error(matchError);
            return;   
        }

        if (matchData) {
            console.log(matchData);
        }
    }



    return (
        <>
            <form className="flex flex-col gap-10"> 
                <input type="text" placeholder="your name" name="name" onChange={(e) => {setName(e.target.value)}} />
                <input type="text" placeholder="room code" name="roomCode" onChange={(e) => {setRoomCode(e.target.value)}} />

                <div className="flex flex-row gap-10">
                    <button type="button" onClick={(e) => {handleJoinRoom(e)}}>Join Game</button>
                    <button type="button" onClick={(e) => {handleCreateRoom(e)}}>Create Room</button>
                </div>

                {matchId && <p>Match ID: {matchId}</p>}
                {error && <p className="text-red-500">{error}</p>}
            </form>

            <Board isMultiplayer={true} matchId={matchId} onMultiplayerMove={handleMultiplayerMove} />
        </>
    )
}