import React from "react";
import {Button, Card} from "antd";
import querystring from "querystring";
import {withRouter} from 'react-router-dom';
import request from 'request';
import cookie from "react-cookies";
import {backendURL} from "../dependency";


export class Spotifunk extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            isPlaylistClicked: false,
            isTopTenClicked: false
        }
    }
    login() {
        const generateRandomString = function (length) {
            let text = '';
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

            for (let i = 0; i < length; i += 1) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };

        const state = generateRandomString(16);
        const scope = 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative';
        window.open(`https://accounts.spotify.com/authorize?${
            querystring.stringify({
                response_type: 'code',
                client_id: '682367fe3a8a41a0b81f34dc5c6fe936',
                scope,
                redirect_uri: `${backendURL}/callback` ,
                state})
            })}`, '_self');
    }
    componentDidMount() {
        const parsedQuery = querystring.parse(this.props.location.search);
        const queryRefreshToken = parsedQuery['?refresh_token'];
        if (queryRefreshToken !== undefined) {
            // TODO: fix this
            this.setState({'refreshToken':queryRefreshToken});
        }
    }

    getTopTenSongs(){
        var options = { method: 'GET',
            json:true,
            url: `${backendURL}/top-10`,
            qs: { refreshToken: this.state.refreshToken },
            headers:
                { 'Postman-Token': '87b33f0a-d49f-42cc-b4f6-e8ec657df404',
                    'cache-control': 'no-cache' } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            let finalPlaylist;
            if (this.state.isTopTenClicked){
                this.setState({renderedSongs:"", isTopTenClicked: false})
            } else {
                let embed_url = `https://open.spotify.com/embed/user/${body.user_id}/playlist/${body.playlist_id}`
                // src="https://open.spotify.com/embed/user/1215854297/playlist/0aAotlEvLxpi4QgWk97CZK"
                finalPlaylist = (
                    <iframe title="playlist" src={embed_url} width="300" height="380"
                            frameBorder="0" allowTransparency="true" allow="encrypted-media"></iframe>
                )
                this.setState({renderedSongs:finalPlaylist, isTopTenClicked: true})
            }


        }.bind(this));

    }


    roadTripMe(){
        if (this.state.isPlaylistClicked){
            this.setState({renderedPlaylist:"", isPlaylistClicked: false})
        } else {
            let playlist = (
                <iframe title="public-playlist" src="https://open.spotify.com/embed/user/1215854297/playlist/0aAotlEvLxpi4QgWk97CZK" width="280"
                        height="380" frameBorder="0" allowTransparency="true" allow="encrypted-media"></iframe>)
            this.setState({renderedPlaylist:playlist, isPlaylistClicked: true})
        }


    }

    render() {
        if (this.state.refreshToken) {
            return (
                <div>
                    <Card>
                        {this.state.renderedSongs}
                        {this.state.renderedPlaylist}
                        <Button type="primary" onClick={() => this.getTopTenSongs()}>Top 10 Songs</Button>
                        <Button type="primary" onClick={() => this.roadTripMe()}>Road Trip Me</Button>
                    </Card>
                </div>
            )
        } else {
            return (
                <div>
                    <Card>
                        <Button type="primary" onClick={() => this.login()}>Spotifunk</Button>
                    </Card>

                </div>
            );
        }
    }
}

export default withRouter(Spotifunk)
