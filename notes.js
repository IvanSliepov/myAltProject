/**/
var Note = React.createClass({
    render: function() {
        var style = { backgroundColor: this.props.color };
        return (
            <div className="note" style={style}>
                <span className="delete-note" onClick={this.props.onDelete}> × </span>
                {this.props.children}
            </div>
        );
    }
});
/*тут заметки вносятся*/
var NoteEditor = React.createClass({
    getInitialState: function() {
        return {
            text: ''
        };
    },

    handleTextChange: function(event) {
        this.setState({ text: event.target.value });
    },
//id присваивается здесь
    handleNoteAdd: function() {
        var newNote = {
            text: this.state.text,
            color: 'yellow',
            id: Date.now()
        };

        this.props.onNoteAdd(newNote);
        //очищение поля ввода текста после добавки заметки
        this.setState({ text: '' });
    },
//отображение поля для внесения заметок
   render: function() {
        return (
            <div className="note-editor">
                <textarea
                    placeholder="Enter your note here..."
                    rows={5}
                    className="textarea"
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <button className="add-button" onClick={this.handleNoteAdd}>Add</button>
            </div>
        );
    }
});

/*тут хранятся и отображаются заметки*/
var NotesGrid = React.createClass({
    componentDidMount: function() {
        var grid = this.refs.grid;
        this.msnry = new Masonry( grid, {
            itemSelector: '.note',
            columnWidth: 200,
            gutter: 10,
            isFitWidth: true
        });
    },
/*метод вызывающийся после внесения изменения в ДОМ + сравнивается длина заметки*/
    componentDidUpdate: function(prevProps) {
        if (this.props.notes.length !== prevProps.notes.length) {
            //тут сравниваются заметки
            this.msnry.reloadItems();
            //тут после добавления заметки идёт перестройка Masonry
            this.msnry.layout();
        }
    },
/*удаление заметки*/
    render: function() {
        var onNoteDelete = this.props.onNoteDelete;
/*компоненты инициализируются с помощью id которое присваивается по времени создания*/
        return (
            <div className="notes-grid" ref="grid">
                {
                    this.props.notes.map(function(note){
                        return (
                            <Note
                                key={note.id}
                                //обработчик удаления
                                onDelete={onNoteDelete.bind(null, note)}
                                color={note.color}>
                                {note.text}
                            </Note>
                        );
                    })
                }
            </div>
        );
    }
});

/*тут происходит настройка поведения компонентов */

var NotesApp = React.createClass({
    //объявление статуса(массив)
    getInitialState: function() {
        return {
            notes: []
        };
    },
//открытие сохранённых заметок
    componentDidMount: function() {
        var localNotes = JSON.parse(localStorage.getItem('notes'));
        if (localNotes) {
            this.setState({ notes: localNotes });
        }
    },
//подтверждения внесения заметки в локалку или удаления
    componentDidUpdate: function() {
        this._updateLocalStorage();
    },
//принимает заметку на удаление, срабатывает после онклика (callback)
    handleNoteDelete: function(note) {
        var noteId = note.id;
        var newNotes = this.state.notes.filter(function(note) {
            return note.id !== noteId;
        });
        this.setState({ notes: newNotes });
    },
//принимает заметку на добавление
    handleNoteAdd: function(newNote) {
        var newNotes = this.state.notes.slice();
        newNotes.unshift(newNote);
        this.setState({ notes: newNotes });
    },

    render: function() {
        return (
            <div className="notes-app">
                <h2 className="app-header">NotesApp</h2>
                <NoteEditor onNoteAdd={this.handleNoteAdd} />
                //сюда в параметрах передается массив из NotesApp 
                <NotesGrid notes={this.state.notes} onNoteDelete={this.handleNoteDelete} />
            </div>
        );
    },
//хранение существующих заметок до закрытия сервера
    _updateLocalStorage: function() {
        //приведение инфы к стринговому значению
        var notes = JSON.stringify(this.state.notes);
        //объявление объекта который будет изменяться
        localStorage.setItem('notes', notes);
    }
});

ReactDOM.render(
    <NotesApp />,
    document.getElementById('mount-point')
);