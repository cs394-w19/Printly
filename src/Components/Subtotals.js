import React from 'react';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import '../App.css'

const theme = createMuiTheme({
	overrides: {
		MuiList: {
			padding: {
				paddingBottom: '0px',
			},
		},
		MuiTypography: {
			subheading: {
				fontWeight: 'bold',
				fontSize: '1.2em',
			},
			body1: {
				fontSize: '1.2em',
			},
		},
		MuiListItem: {
			root: {
				textAlign: 'center',
			},
			gutters: {
				paddingLeft: '10px',
				paddingRight: '10px',
				paddingBottom: '10px',
			},
		},
		MuiListItemText: {
			root: {
				paddingRight: '0',
			},
		},
	},
});

const styles = ({
	root: {
		height: '100%',
		backgroundColor: 'white',
		border: '1px solid black',
		borderRadius: '10px',
	},
});

class Subtotals extends React.Component {
	prettyText = (input) => {
		return "$" + parseFloat(input).toFixed(2)
	}


	render() {
		const { classes } = this.props;
		return (
			<div className={classes.root} >
				<MuiThemeProvider theme={theme}>
					<List>
						<ListItem>
							<ListItemText primary="Grand Total" className = "flashit"
											secondary={this.prettyText(parseFloat(this.props.price) + parseFloat(this.props.deliv_fee))}/>
						</ListItem>
					</List>
				</MuiThemeProvider>
			</div>
		);
	}
}

export default withStyles(styles, { withTheme: true })(Subtotals);